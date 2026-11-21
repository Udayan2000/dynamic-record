import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOAuthClient } from "@/lib/google";
import { google } from "googleapis";
import { Readable } from "stream";
import { getSession } from "@/lib/auth";

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

function toRoman(numStr: string): string {
  const num = parseInt(numStr, 10);
  if (isNaN(num) || num <= 0 || num > 3999) return String(numStr);
  const roman = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let str = '';
  let n = num;
  for (let i of Object.keys(roman)) {
    let q = Math.floor(n / roman[i as keyof typeof roman]);
    n -= q * roman[i as keyof typeof roman];
    str += i.repeat(q);
  }
  return str;
}

const getProp = (data: any, keys: string[], defaultVal: string) => {
  if (!data) return defaultVal;
  for (const key of keys) {
    const matchedKey = Object.keys(data).find(k => k.toLowerCase().includes(key));
    if (matchedKey) return String(data[matchedKey]).trim();
  }
  return defaultVal;
};

const escapeDriveQueryName = (name: string) => {
  return name.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("google_access_token")?.value;
    const refreshToken = cookieStore.get("google_refresh_token")?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ error: "Unauthorized Google Drive" }, { status: 401 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized App" }, { status: 401 });
    }

    const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001/api";
    const profileRes = await fetch(`${API_BASE}/admin/profile`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (!profileRes.ok) throw new Error("Failed to fetch admin credentials");
    
    const profile = await profileRes.json();
    const clientId = profile.googleDriveCredentials?.clientId;
    const clientSecret = profile.googleDriveCredentials?.clientSecret;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Google Drive Credentials missing" }, { status: 400 });
    }

    const oauth2Client = getOAuthClient(clientId, clientSecret);
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    oauth2Client.on("tokens", (tokens) => {
      if (tokens.access_token) {
        cookieStore.set("google_access_token", tokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 3600,
        });
      }
      if (tokens.refresh_token) {
        cookieStore.set("google_refresh_token", tokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        });
      }
    });

    const body = await request.json();
    const { templateName, fields, hasCameraAccess, templateId, search = "" } = body;

    if (!templateName || !templateId) {
      return NextResponse.json({ error: "Missing template data" }, { status: 400 });
    }

    // Fetch records server-side to avoid massive browser payloads
    const recordsRes = await fetch(`${API_BASE}/records?templateId=${templateId}&search=${encodeURIComponent(search)}&limit=10000`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });
    
    if (!recordsRes.ok) {
      return NextResponse.json({ error: "Failed to fetch records for export" }, { status: 500 });
    }

    const recordsData = await recordsRes.json();
    const records = recordsData.records || [];

    if (!records.length) {
      return NextResponse.json({ error: "No records to export" }, { status: 400 });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    async function getOrCreateFolder(folderName: string, parentId?: string) {
      const escapedName = escapeDriveQueryName(folderName);
      let query = `mimeType='application/vnd.google-apps.folder' and name='${escapedName}' and trashed=false`;
      if (parentId) query += ` and '${parentId}' in parents`;
      
      const search = await drive.files.list({ q: query, fields: 'files(id, name)', spaces: 'drive' });
      if (search.data.files && search.data.files.length > 0) return search.data.files[0].id as string;

      const fileMetadata: any = { name: folderName, mimeType: 'application/vnd.google-apps.folder' };
      if (parentId) fileMetadata.parents = [parentId];
      
      const folder = await drive.files.create({ requestBody: fileMetadata, fields: 'id' });
      return folder.data.id as string;
    }

    async function uploadOrUpdateFile(
      fileName: string, 
      mimeType: string, 
      parentId: string, 
      mediaBuffer: Buffer
    ) {
      const cleanMime = (mimeType || 'application/octet-stream').split(';')[0].trim();
      const escapedName = escapeDriveQueryName(fileName);
      const query = `name='${escapedName}' and '${parentId}' in parents and trashed=false`;
      
      const search = await drive.files.list({ 
        q: query, 
        fields: 'files(id, name, webViewLink)', 
        spaces: 'drive' 
      });
      const existingFile = search.data.files && search.data.files.length > 0 ? search.data.files[0] : null;

      if (existingFile?.id) {
        // Update existing file: pass requestBody to guarantee multipart upload protocol
        const updated = await drive.files.update({
          fileId: existingFile.id,
          requestBody: { name: fileName },
          media: { mimeType: cleanMime, body: Readable.from(mediaBuffer) },
          fields: 'id, webViewLink'
        });
        return { 
          ...updated.data, 
          isNew: false, 
          webViewLink: updated.data.webViewLink || existingFile.webViewLink 
        };
      } else {
        // Create new file
        const created = await drive.files.create({
          requestBody: { name: fileName, parents: [parentId] },
          media: { mimeType: cleanMime, body: Readable.from(mediaBuffer) },
          fields: 'id, webViewLink'
        });
        return { 
          ...created.data, 
          isNew: true 
        };
      }
    }

    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0];
    const rootName = `${templateName}_${formattedDate}`;
    const rootFolderId = await getOrCreateFolder(rootName);

    // Group Records
    const groups = new Map<string, { school: string, classRoman: string, section: string, roll: string, isDummy: boolean, records: any[] }>();
    
    for (const record of records) {
      const school = getProp(record.data, ['school', 'institution', 'college', 'clg', 'institute'], '');
      const cls = getProp(record.data, ['class', 'grade', 'standard'], '');
      const section = getProp(record.data, ['section', 'batch', 'group'], '');
      const roll = getProp(record.data, ['roll', 'roll no', 'roll number'], '');
      
      const isDummy = !school || !cls || !section || !roll;
      const classRoman = isDummy ? '' : toRoman(cls);
      
      const groupKey = isDummy ? 'dummy_group' : `${school}_${classRoman}_${section}_${roll}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, { school, classRoman, section, roll, isDummy, records: [] });
      }
      groups.get(groupKey)!.records.push(record);
    }

    const exportedLinks: string[] = [];

    // Process each group
    for (const [_, group] of Array.from(groups.entries())) {
      let rollFolderId: string;
      
      if (group.isDummy) {
        rollFolderId = await getOrCreateFolder("dummy", rootFolderId);
      } else {
        const highSchoolFolderId = await getOrCreateFolder(group.school, rootFolderId);
        const classFolderId = await getOrCreateFolder(group.classRoman, highSchoolFolderId);
        const sectionFolderId = await getOrCreateFolder(group.section, classFolderId);
        rollFolderId = await getOrCreateFolder(group.roll, sectionFolderId);
      }
      
      let imageFolderId: string | null = null;
      if (hasCameraAccess) {
        imageFolderId = await getOrCreateFolder("image", rollFolderId);
      }

      const headers = ["Submitted By", "Email", "Date Submitted", ...fields.map((f: any) => f.label)];
      if (hasCameraAccess) headers.push("Photo Drive Link");

      const csvRows = [headers.join(",")];

      for (const record of group.records) {
        const rowData = [
          `"${record.submitterName || ""}"`,
          `"${record.submitterEmail || ""}"`,
          `"${new Date(record.createdAt).toLocaleString()}"`,
        ];

        fields.forEach((f: any) => {
          const val = record.data?.[f.label];
          rowData.push(Array.isArray(val) ? `"${val.join(", ")}"` : `"${val || ""}"`);
        });

        let photoLink = "None";
        if (hasCameraAccess && record.data?.["Attached Photo"] && imageFolderId) {
          const photoData = record.data["Attached Photo"];
          
          try {
            let buffer: Buffer | null = null;
            let mimeType = "image/jpeg";

            if (photoData.startsWith("http")) {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 15000);
              const imgResponse = await fetch(photoData, { signal: controller.signal });
              clearTimeout(timeout);
              if (imgResponse.ok) {
                const arrayBuffer = await imgResponse.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
                mimeType = imgResponse.headers.get("content-type") || "image/jpeg";
              }
            } else {
              // Fallback for legacy base64 records
              const matches = photoData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
              if (matches && matches.length === 3) {
                buffer = Buffer.from(matches[2], 'base64');
                mimeType = matches[1];
              }
            }

            if (buffer) {
              let studentName = getProp(record.data, ['name', 'student', 'first name', 'full name'], '');
              if (!studentName || studentName.toLowerCase() === 'unknown') {
                studentName = record.submitterName && record.submitterName !== 'Unknown' ? record.submitterName : 'User';
              }
              
              const imageName = group.isDummy
                ? `dummy_${studentName}.jpg`.replace(/\s+/g, '_')
                : `${group.classRoman}_${group.section}_${group.roll}_${studentName}.jpg`.replace(/\s+/g, '_');
              
              const uploadedImg = await uploadOrUpdateFile(imageName, mimeType, imageFolderId, buffer);
              
              if (uploadedImg?.id) {
                // Only grant permission if newly created, avoids redundant failing calls on update
                if (uploadedImg.isNew) {
                  try {
                    await drive.permissions.create({ 
                      fileId: uploadedImg.id, 
                      requestBody: { role: 'reader', type: 'anyone' } 
                    });
                  } catch (permErr) { /* ignore permission error */ }
                }
                photoLink = uploadedImg.webViewLink || uploadedImg.id;
              }
            }
          } catch (imgError) {
            console.error("Image upload failed:", imgError);
            photoLink = "Upload Failed";
          }
        }

        if (hasCameraAccess) rowData.push(`"${photoLink}"`);
        csvRows.push(rowData.join(","));
      }

      const csvFileName = group.isDummy 
        ? `${templateName}_dummy.csv`
        : `${templateName}_${group.school}_${group.classRoman}_${group.section}_${group.roll}.csv`;
      
      const csvBuffer = Buffer.from(csvRows.join("\n"), "utf-8");
      const csvFile = await uploadOrUpdateFile(csvFileName, "text/csv", rollFolderId, csvBuffer);
      
      if (csvFile?.webViewLink) exportedLinks.push(csvFile.webViewLink);
    }

    return NextResponse.json({ success: true, links: exportedLinks });

  } catch (error) {
    console.error("Drive error:", error);
    if ((error as any)?.message?.includes('No access') || (error as any)?.code === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to upload file", details: String(error) }, { status: 500 });
  }
}
