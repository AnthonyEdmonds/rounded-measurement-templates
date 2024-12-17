import { Settings } from './settings.js';

export class RoundedMeasurementTemplates
{
    static bypass;

    /**
     * Change the angle of a cone template
     * @param {MeasuredTemplate} preview 
     */
    static adjustCone(preview, increase)
    {
        if (increase === true) {
            if (preview.document.angle < 360) {
                preview.document.angle += Settings.coneAngleAdjustment;
            }
        } else {
            if (preview.document.angle > 0) {
                preview.document.angle -= Settings.coneAngleAdjustment;
            }
        }

        preview.renderFlags.set({refreshShape: true});
    }

    /**
     * Change the width of a ray template
     * @param {MeasuredTemplate} preview
     * @param {boolean} increase
     */
    static adjustRay(preview, increase)
    {
        if (increase === true) {
            preview.document.width += Settings.rayWidthAdjustment;
        } else {
            if (preview.document.width > 0) {
                preview.document.width -= Settings.rayWidthAdjustment;
            }
        }

        preview.renderFlags.set({refreshShape: true});
    }

    /**
     * Adjust a template while holding the control key
     * @param {Bt} event
     */
    static adjustTemplate(event)
    {
        if (typeof globalThis.RoundedMeasurementTemplates.mouseY === 'number') {
            const increase = globalThis.RoundedMeasurementTemplates.mouseY > event.y;
            const preview = event.interactionData.preview;

            switch (preview.document.t) {
                case 'cone':
                    RoundedMeasurementTemplates.adjustCone(preview, increase);
                    break;

                case 'ray':
                    RoundedMeasurementTemplates.adjustRay(preview, increase);
                    break;
            }
        }

        globalThis.RoundedMeasurementTemplates.mouseY = event.y;
    }

    /** 
     * Handle drawing templates
     * @param {Bt} event 
     * */
    static handle(event)
    {
        switch (true) {
            case event.shiftKey === true:
                globalThis.RoundedMeasurementTemplates.mouseY = null;
                RoundedMeasurementTemplates.bypass(event);
                break;

            case event.ctrlKey === true:
                RoundedMeasurementTemplates.adjustTemplate(event);
                break;

            default:
                globalThis.RoundedMeasurementTemplates.mouseY = null;
                RoundedMeasurementTemplates.snapTemplate(event);
        }     
    }

    /**
     * Calculate a direction in degrees between 0 and 360
     * @param {Object} origin
     * @param {Object} destination
     * @returns {number}
     */
    static normalisedDirection(origin, destination)
    {
        return Math.normalizeDegrees(
            Math.toDegrees(
                new Ray(origin, destination).angle,
            ),
        );
    }

    /**
     * Calculate the distance and direction for circle, cone, and ray templates
     * @param {Object} interactionData 
     * @returns {Object}
     */
    static processLine(interactionData)
    {
        const direction = RoundedMeasurementTemplates.normalisedDirection(interactionData.origin, interactionData.destination);
        const distance = canvas.grid.measurePath([interactionData.origin, interactionData.destination]).distance;
        const directionSnapping = interactionData.preview.document.t !== 'ray'
            ? Settings.coneDirectionSnapping
            : Settings.rayDirectionSnapping;

        return {
            direction: directionSnapping === 0
                ? direction
                : RoundedMeasurementTemplates.roundToMultiple(direction, directionSnapping),
            distance: RoundedMeasurementTemplates.roundDistance(distance),
        };
    }

    /**
     * Calculate the distance and direction for rectangule templates
     * @param {Object} interactionData 
     * @returns {Object}
     */
    static processRectangle(interactionData)
    {
        const scale = Settings.canvasScale;
        const originalDirection = RoundedMeasurementTemplates.normalisedDirection(interactionData.origin, interactionData.destination);

        let offset = 0;
        let flip = false;

        switch (true) {
            case originalDirection <= 90:
                break;

            case originalDirection <= 180:
                flip = true;
                offset = 90;
                break;

            case originalDirection <= 270:
                offset = 180;
                break;

            case originalDirection <= 360:
                flip = true;
                offset = 270;
                break;
        }

        const distanceX = RoundedMeasurementTemplates.snappedDistance(
            interactionData.origin,
            {
                x: interactionData.destination.x,
                y: interactionData.origin.y,
            },
        );

        const distanceY = RoundedMeasurementTemplates.snappedDistance(
            interactionData.origin,
            {
                x: interactionData.origin.x,
                y: interactionData.destination.y,
            },
        );

        const destination = {
            x: interactionData.origin.x + distanceX * scale,
            y: interactionData.origin.y + distanceY * scale,
        };

        let direction = RoundedMeasurementTemplates.normalisedDirection(interactionData.origin, destination);
        const distance = canvas.grid.measurePath([interactionData.origin, destination]).distance;

        if (flip === true) {
            direction = 90 - direction;
        }

        return {
            distance: distance,
            direction: direction + offset,
            height: distanceX,
            width: distanceY,
        };
    }

    /**
     * Calculate the snapped distance between two points
     * @param {Object} origin
     * @param {Object} destination
     * @returns {number}
     */
    static snappedDistance(origin, destination)
    {
        return RoundedMeasurementTemplates.roundDistance(
            canvas.grid.measurePath([origin, destination]).distance,
        );
    }

    /**
     * Snap a template
     * @param {Bt} event
     */
    static snapTemplate(event)
    {
        event.interactionData.preview.document.t !== 'rect'
            ? RoundedMeasurementTemplates.snapLine(event.interactionData)
            : RoundedMeasurementTemplates.snapRectangle(event.interactionData);
    }

    /**
     * Snap a circle, cone, or ray template
     * @param {Object} interactionData 
     */
    static snapLine(interactionData)
    {
        const interaction = RoundedMeasurementTemplates.processLine(interactionData);
        RoundedMeasurementTemplates.updatePreview(interactionData.preview, interaction.distance, interaction.direction);
    }

    /**
     * Snap a rectangle template
     * @param {Object} interactionData 
     */
    static snapRectangle(interactionData)
    {
        const interaction = RoundedMeasurementTemplates.processRectangle(interactionData);
        RoundedMeasurementTemplates.updatePreview(interactionData.preview, interaction.distance, interaction.direction);
    }

    /**
     * Update the Template preview
     * @param {MeasuredTemplate} preview    The Template preview
     * @param {number} distance             The distance in game units
     * @param {number} direction            The direction in degrees
     */
    static updatePreview(preview, distance, direction)
    {
        preview.document.distance = distance;
        preview.document.direction = direction;
        preview.renderFlags.set({refreshShape: true});
    }

    /**
     * Wrap the template drag handler
     */
    static wrap()
    {
        RoundedMeasurementTemplates.bypass = TemplateLayer.prototype._onDragLeftMove;

        libWrapper.register(
            Settings.namespace,
            'TemplateLayer.prototype._onDragLeftMove',
            RoundedMeasurementTemplates.handle,
            'OVERRIDE',
        );
    }

    /**
     * Round a distance to the nearest multiple or step
     * @param {number} distance
     * @returns {number}
     */
    static roundDistance(distance)
    {
        return Settings.useSteps === true
            ? RoundedMeasurementTemplates.roundToStep(distance)
            : RoundedMeasurementTemplates.roundToMultiple(distance, Settings.distanceSnapping, Settings.distanceSnapping);
    }

    /**
     * Round a given distance to the nearest step
     * @param {number} distance
     * @returns {number}
     */
    static roundToStep(distance)
    {
        const steps = Settings.steps;

        if (
            Settings.measureBeyondSteps === true
            && distance > steps[steps.length - 1]
        ) {
            return RoundedMeasurementTemplates.roundToMultiple(
                distance,
                Settings.distanceSnapping,
                steps[steps.length - 1],
            );
        } else {
            return steps.reduce(function (previous, current) {
                return Math.abs(current - distance) < Math.abs(previous - distance)
                    ? current
                    : previous;
            });
        }
    }

    /**
     * Round a given distance to the given multiple
     * @param {number} distance
     * @param {number} multiple
     * @param {number} minimum
     * @returns {number}
     */
    static roundToMultiple(distance, multiple, minimum = null)
    {
        if (minimum === null) {
            minimum = multiple;
        }

        return Math.max(Math.round(distance / multiple) * multiple, minimum);
    }
}
