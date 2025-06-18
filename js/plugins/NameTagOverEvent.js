//=============================================================================
// NameTagOverEvent.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Menampilkan nama bangunan di atas event saat player mendekat (dari arah manapun).
 * @author ChatGPT
 * 
 * @help
 * Cara Pakai:
 * 1. Pasang plugin ini di Plugin Manager.
 * 2. Di event (misal pintu bangunan), tambahkan Comment:
 *    <NameTag: Sekolah>
 * 
 * Nama akan muncul di atas event saat player berada dalam jarak 1.5 tile.
 */

(() => {
  const RANGE = 7.5; // Jarak radius (Euclidean distance)

  let activeEvents = [];

  const alias_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    alias_update.call(this);
    activeEvents = [];

    const events = $gameMap.events();
    for (const ev of events) {
      if (!ev.page()) continue;

      const comments = ev.list()
        .filter(cmd => cmd.code === 108 || cmd.code === 408)
        .map(cmd => cmd.parameters[0]);

      const tagLine = comments.find(line => /<NameTag:\s*(.+)>/.test(line));
      if (tagLine) {
        const tag = tagLine.match(/<NameTag:\s*(.+)>/)[1].trim();

        const dx = $gamePlayer.x - ev.x;
        const dy = $gamePlayer.y - ev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= RANGE) {
          activeEvents.push({ ev, tag });
        }
      }
    }
  };

  const alias_createAllWindows = Scene_Map.prototype.createAllWindows;
  Scene_Map.prototype.createAllWindows = function () {
    alias_createAllWindows.call(this);
    this._nameTagSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
    this.addChild(this._nameTagSprite);
  };

  const alias_updateMain = Scene_Map.prototype.updateMain;
  Scene_Map.prototype.updateMain = function () {
    alias_updateMain.call(this);
    const bmp = this._nameTagSprite.bitmap;
    bmp.clear();

    for (const { ev, tag } of activeEvents) {
      const sx = $gameMap.adjustX(ev.x);
      const sy = $gameMap.adjustY(ev.y);
      const px = sx * $gameMap.tileWidth();
      const py = (sy - 1) * $gameMap.tileHeight(); // 1 tile di atas

      bmp.fontSize = 20;
      bmp.textColor = "#ffffff";
      bmp.outlineColor = "black";
      bmp.outlineWidth = 4;
      bmp.drawText(tag, px - 50, py, 100, 36, "center");
    }
  };
})();
