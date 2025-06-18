/*:
 * @target MZ
 * @plugindesc Menampilkan logo UNIKU & DGMC kecil di pojok kanan atas, sejajar horizontal - by ChatGPT
 * @author ChatGPT
 * @help
 * Simpan:
 * - logo_uniku.png
 * - logo_dgmc.png
 * di folder img/pictures/
 */

(() => {
    const MAX_WIDTH = 100; // Ukuran logo maksimum (px)

    const _Scene_Title_create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function() {
        _Scene_Title_create.call(this);

        const spacing = 10; // Jarak antar logo
        const topMargin = 20;

        // Logo UNIKU
        const logoUNIKU = new Sprite(ImageManager.loadPicture("logo_uniku"));
        logoUNIKU.anchor.set(1, 0); // kanan atas
        logoUNIKU.x = Graphics.width - 20;
        logoUNIKU.y = topMargin;

        // Logo DGMC
        const logoDGMC = new Sprite(ImageManager.loadPicture("logo_dgmc"));
        logoDGMC.anchor.set(1, 0); // kanan atas juga
        logoDGMC.y = topMargin;

        // Setelah logo UNIKU load, atur scale dan posisi DGMC
        logoUNIKU.bitmap.addLoadListener(() => {
            let scale = 1;
            if (logoUNIKU.bitmap.width > MAX_WIDTH) {
                scale = MAX_WIDTH / logoUNIKU.bitmap.width;
                logoUNIKU.scale.set(scale, scale);
            }

            const unikuWidth = logoUNIKU.bitmap.width * logoUNIKU.scale.x;
            logoDGMC.x = logoUNIKU.x - unikuWidth - spacing;
        });

        logoDGMC.bitmap.addLoadListener(() => {
            if (logoDGMC.bitmap.width > MAX_WIDTH) {
                const scale = MAX_WIDTH / logoDGMC.bitmap.width;
                logoDGMC.scale.set(scale, scale);
            }
        });

        this.addChild(logoDGMC);
        this.addChild(logoUNIKU);
    };
})();
