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
