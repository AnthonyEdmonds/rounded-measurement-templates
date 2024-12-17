import { RoundedMeasurementTemplates } from './RoundedMeasurementTemplates.js';
import { Settings } from './settings.js';

Hooks.on('init', function () {
    globalThis.RoundedMeasurementTemplates = {
        mouseY: null,
    };

    Settings.register();
});

Hooks.on('closeSettingsConfig', Settings.update);

Hooks.on('canvasInit', Settings.update);

Hooks.on('libWrapper.Ready', RoundedMeasurementTemplates.wrap);
