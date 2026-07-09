import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export default async function compressToWebp(buffer, filename, outputDir = 'uploads/produk-ads') {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `${filename}-${Date.now()}.webp`;
    const outputPath = path.join(outputDir, fileName);

    await sharp(buffer).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 75 }).toFile(outputPath);

    // simpan path relatif publik, bukan path lokal absolut
    return `/uploads/produk-ads/${fileName}`;
}
