// register module settings for multiple to round to
Hooks.once("init", function() {
  game.settings.register('rounded-distance-for-measured-templates', 'distance-multiple', {
    name: "What multiple should the distances for your measured templated be?",
    hint: "The multiple you want the measured templates distance to round to. If left blank, the measured templates will be rounded based on the scenes grid distance.",
    scope: 'world',
    config: true,
    restricted: true,
    default: "",
    type: String,
  });

  game.settings.register('rounded-distance-for-measured-templates', 'angle-multiple', {
    name: "What multiple should the angle for cones and rays be rounded to?",
    hint: "The multiple you want the angle for cones and rays to snap. If left blank, there won't be any angle snapping.",
    scope: 'world',
    config: true,
    restricted: true,
    default: "",
    type: String,
  });
});

// round to nearest multiple
const roundToMultiple = (number, multiple, minimum) => {
  return (Math.sign(number) < 0) ? Math.min(Math.round(number / multiple) * multiple, -minimum) : Math.max(Math.round(number / multiple) * multiple, minimum);
}

Hooks.on("ready", () => {
  TemplateLayer.prototype._onDragLeftMove = function(event) {
    const {
      destination,
      createState,
      preview,
      origin
    } = event.data;

    if (createState === 0) return;
    // Snap the destination to the grid
    event.data.destination = canvas.grid.getSnappedPosition(destination.x, destination.y, this.gridPrecision);
    // Compute the ray
    const ray = new Ray(origin, destination);
    const ratio = (canvas.dimensions.size / canvas.dimensions.distance);


    // Start amended code to round distances
    let distanceMultiple = game.settings.get('rounded-distance-for-measured-templates', 'distance-multiple') || canvas.scene.data.gridDistance;
    let angleMultiple = game.settings.get('rounded-distance-for-measured-templates', 'angle-multiple');

    if (preview.data.t === "rect") { // if measured template is a rectangle.
      // round width and height to nearest multiple.
      ray.dx = roundToMultiple(ray.dx, ratio * distanceMultiple, distanceMultiple);
      ray.dy = roundToMultiple(ray.dy, ratio * distanceMultiple, distanceMultiple);

      // set new ray distance based on updated width and height values
      ray.distance = Math.hypot(ray.dx, ray.dy);

      // when the width is a negative value (to the left of the origin point), foundry shows the angle becomes >90 or <-90, so have to add those values back to the angles as they get set to to <90 and >-90 based on calculatin angle of a square
      if (ray.dx < 0 & ray.dy > 0) { // if creating to the bottom left of start point
        ray.angle = toRadians(90) - Math.atan(ray.dx / ray.dy);
      } else if (ray.dx < 0 && ray.dy < 0) { // if creating to the top left of start point
        ray.angle = toRadians(-90) - Math.atan(ray.dx / ray.dy);
      } else { // if creating to the right of the start point
        ray.angle = Math.atan(ray.dy / ray.dx);
      }
    } else { // if measured template is anything other than a rectangle.
      ray.distance = roundToMultiple(ray.distance, ratio * distanceMultiple, ratio * distanceMultiple);
    }

    // round angles to nearest angleMultiple for cones and rays
    if ((preview.data.t === "cone" || preview.data.t === "ray") && angleMultiple) {
      // round angle
      ray.angle = toRadians(roundToMultiple(toDegrees(ray.angle), angleMultiple, 0));
    }
    // End amended code to round distances


    // Update the preview object
    preview.data.direction = toDegrees(ray.angle);
    preview.data.distance = ray.distance / ratio;
    preview.refresh();
    // Confirm the creation state
    event.data.createState = 2;
  };
});