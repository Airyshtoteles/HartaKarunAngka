//=============================================================================
// DynamicPlayerName.js
// Plugin untuk sistem nama dinamis di RPG Maker MZ
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Dynamic Player Name v2.0.0
 * @author RPGDevHelper
 * @url 
 * @help DynamicPlayerName.js
 * 
 * Plugin sistem nama dinamis untuk game Arithmora.
 * Memungkinkan pemain mengubah nama karakter utama (Actor 001).
 * 
 * Fitur Utama:
 * - Input nama menggunakan UI RPG Maker native
 * - Otomatis update nama Actor 001 di database
 * - Validasi input dengan fallback ke nama default
 * - Konfirmasi nama sebelum disimpan
 * - Kompatibel dengan save/load system
 * - Plugin commands yang mudah digunakan
 * 
 * Cara Penggunaan:
 * 1. Aktifkan plugin di Plugin Manager
 * 2. Gunakan Plugin Command "Change Player Name" di event
 * 3. Gunakan \N[1] untuk referensi nama di dialog
 * 
 * Plugin Commands:
 * - changePlayerName: Membuka dialog input nama
 * 
 * @param defaultName
 * @text Default Name
 * @desc Nama default jika input kosong
 * @type string
 * @default Budi
 * 
 * @param maxNameLength
 * @text Max Name Length
 * @desc Panjang maksimal nama (1-16 karakter)
 * @type number
 * @min 1
 * @max 16
 * @default 12
 * 
 * @param showWelcome
 * @text Show Welcome Message
 * @desc Tampilkan pesan selamat datang sebelum input
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * 
 * @param welcomeText
 * @text Welcome Text
 * @desc Pesan selamat datang (jika diaktifkan)
 * @type note
 * @default "Selamat datang di dunia Arithmora!\nSiapa namamu, petualang muda?"
 * 
 * @param confirmName
 * @text Confirm Name
 * @desc Minta konfirmasi nama sebelum disimpan
 * @type boolean
 * @on Yes
 * @off No
 * @default true * 
 * @command changePlayerName
 * @text Change Player Name
 * @desc Membuka dialog untuk mengubah nama pemain
 * 
 * Version: 2.0.0
 * Compatibility: RPG Maker MZ
 * License: Free for commercial and non-commercial use
 */

(() => {
    'use strict';
    
    // === PLUGIN SETUP ===
    const pluginName = 'DynamicPlayerName';
    const parameters = PluginManager.parameters(pluginName);
    
    const defaultName = parameters['defaultName'] || 'Budi';
    const maxNameLength = parseInt(parameters['maxNameLength']) || 12;
    const showWelcome = parameters['showWelcome'] === 'true';
    const welcomeText = parameters['welcomeText'] || 'Selamat datang di dunia Arithmora!\\nSiapa namamu, petualang muda?';
    const confirmName = parameters['confirmName'] === 'true';
    
    // === PLUGIN COMMAND REGISTRATION ===
    PluginManager.registerCommand(pluginName, "changePlayerName", args => {
        startNameInputProcess();
    });
    
    // === CORE FUNCTIONS ===
    
    // Memulai proses input nama
    function startNameInputProcess() {
        const actor = $gameActors.actor(1);
        if (!actor) {
            console.error('DynamicPlayerName: Actor 001 tidak ditemukan!');
            return;
        }
        
        if (showWelcome) {
            showWelcomeMessage();
        } else {
            openNameInputScene();
        }
    }
    
    // Menampilkan pesan selamat datang
    function showWelcomeMessage() {
        const message = welcomeText.replace(/\\n/g, '\n');
        $gameMessage.add(message);
        
        // Set callback untuk lanjut ke input nama
        const originalTerminate = $gameMessage.terminateMessage;
        $gameMessage.terminateMessage = function() {
            originalTerminate.call(this);
            $gameMessage.terminateMessage = originalTerminate;
            
            // Delay sedikit sebelum buka name input
            $gameMap._interpreter.wait(30);
            $gameMap._interpreter.setWaitMode('nameInput');
            
            setTimeout(() => {
                openNameInputScene();
            }, 500);
        };
    }
    
    // Membuka scene input nama
    function openNameInputScene() {
        const actor = $gameActors.actor(1);
        SceneManager.push(Scene_Name);
        SceneManager.prepareNextScene(actor.actorId(), maxNameLength);
    }
    
    // === SCENE_NAME CUSTOMIZATION ===
    
    // Override Scene_Name untuk custom behavior
    const _Scene_Name_onInputOk = Scene_Name.prototype.onInputOk;
    Scene_Name.prototype.onInputOk = function() {
        const inputName = this._editWindow.name().trim();
        let finalName = inputName;
        
        // Validasi nama
        if (finalName.length === 0) {
            finalName = defaultName;
        }
        
        // Set nama ke actor
        this._actor.setName(finalName);
        
        // Tutup scene
        this.popScene();
        
        // Tampilkan konfirmasi jika diaktifkan
        if (confirmName) {
            showNameConfirmation(finalName);
        } else {
            showNameAccepted(finalName);
        }
    };
    
    // Menampilkan konfirmasi nama
    function showNameConfirmation(name) {
        const message = `Apakah nama "${name}" sudah benar?`;
        $gameMessage.add(message);
        $gameMessage.setChoices(['Ya, benar!', 'Tidak, ganti nama'], 0, 0);
        $gameMessage.setChoiceCallback(n => {
            if (n === 1) {
                // Ganti nama lagi
                setTimeout(() => {
                    openNameInputScene();
                }, 300);
            } else {
                // Nama sudah benar
                showNameAccepted(name);
            }
        });
    }
    
    // Menampilkan konfirmasi nama diterima
    function showNameAccepted(name) {
        $gameMessage.add(`Selamat datang, ${name}!`);
        $gameMessage.add('Selamat memulai petualangan di dunia Arithmora!');
    }
    
    // === HELPER FUNCTIONS ===
    
    // Script call untuk memulai input nama
    window.startNameInput = function() {
        startNameInputProcess();
    };
    
    // Script call untuk set nama langsung
    window.setPlayerName = function(name) {
        const actor = $gameActors.actor(1);
        if (actor && name && typeof name === 'string') {
            const trimmedName = name.trim();
            if (trimmedName.length > 0 && trimmedName.length <= maxNameLength) {
                actor.setName(trimmedName);
                return true;
            }
        }
        return false;
    };
    
    // Script call untuk mendapatkan nama pemain
    window.getPlayerName = function() {
        const actor = $gameActors.actor(1);
        return actor ? actor.name() : defaultName;
    };
    
    // Script call untuk reset nama ke default
    window.resetPlayerName = function() {
        const actor = $gameActors.actor(1);
        if (actor) {
            actor.setName(defaultName);
            return true;
        }
        return false;
    };
    
    // === GAME INTEGRATION ===
    
    // Override Game_Interpreter untuk handle wait mode
    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'nameInput') {
            return false; // Tidak perlu wait lagi
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };
    
    // Extend Game_Actor untuk validasi nama
    const _Game_Actor_setName = Game_Actor.prototype.setName;
    Game_Actor.prototype.setName = function(name) {
        // Validasi panjang nama
        let validName = String(name).trim();
        if (validName.length > maxNameLength) {
            validName = validName.substring(0, maxNameLength);
        }
        if (validName.length === 0) {
            validName = defaultName;
        }
        
        _Game_Actor_setName.call(this, validName);
    };
    
    console.log(`${pluginName} v2.0.0 loaded successfully!`);
    console.log(`Default name: ${defaultName}, Max length: ${maxNameLength}`);
    
})();
