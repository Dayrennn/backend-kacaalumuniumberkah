import prisma from '../config/prisma.js';

export const getAdsLandingPage = async () => {
    const ads = await prisma.produkAds.findMany({
        include: {
            barang: {
                include: {
                    kategori: true,
                },
            },
        },
    });
    return ads;
};

export const addCompany = async ({ namaPerusahaan, telephone, deskripsiPerusahaan, lokasi, jadwal, email }) => {
    if (!namaPerusahaan) {
        throw new Error('Nama Perusahaan Wajib di Isi');
    }
    if (!telephone && telephone != 0) {
        throw new Error('Nomor Telephone Wajib di Isi');
    }
    if (!deskripsiPerusahaan) {
        throw new Error('Deskripsi Perusahaan Wajib di Isi');
    }
    if (!lokasi) {
        throw new Error('Lokasi Wajib di Isi');
    }
    if (!jadwal) {
        throw new Error('Jadwal Wajib di Isi');
    }
    if (!email) {
        throw new Error('Email Wajib di Isi');
    }

    const profile = await prisma.companyProfile.upsert({
        where: {
            id: 'company-profile',
        },
        update: {
            namaPerusahaan,
            telephone,
            deskripsiPerusahaan,
            lokasi,
            jadwal,
            email,
        },
        create: {
            id: 'company-profile',
            namaPerusahaan,
            telephone,
            deskripsiPerusahaan,
            lokasi,
            jadwal,
            email,
        },
    });

    return profile;
};

export const getCompanyProfile = async () => {
    const result = await prisma.companyProfile.findMany({
        select: {
            namaPerusahaan: true,
            telephone: true,
            deskripsiPerusahaan: true,
            lokasi: true,
            jadwal: true,
            email: true,
        },
    });

    return result;
};
