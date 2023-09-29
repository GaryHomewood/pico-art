function saveSketch(sketchName, sketchId) {
  const canvas = document.getElementById(sketchId) ;
  const dataURL = canvas.toDataURL("image/jpeg");
  const loadingButton = document.getElementById(`${sketchName}-loading`);
  if (loadingButton) {
    loadingButton.innerHTML = '<svg class="spinner" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>'
    loadingButton.disabled = true
  }

  fetch('/api/v1/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'sketchName': sketchName,
      'dataURL': dataURL
    })
  })
  .then(_ => {
    if (loadingButton) {
      loadingButton.innerText = "present_to_all"
      loadingButton.disabled = false
    }
  });
}

/** 
 * Create UI elements for a sketch
 * - label to indicate the pico button
 * - button to reload the sketch
 * - button to upload the sketch to the pico
 *
 * @param {{ p5: any; canvasId: string | undefined; sketchId: string; labelText: string; }} opts
 */
function createUi(opts) {
  const {
    p5, 
    canvasId, 
    sketchId, 
    labelText
  } = opts

  const label = p5.createDiv(labelText);
  label.class(`label-${labelText.toLowerCase()}`)
  label.parent(`sketch-${sketchId}`);

  const actions = p5.createDiv();
  actions.id(`actions-${sketchId}`);
  actions.class('actions');
  actions.parent(`sketch-${sketchId}`);

  const buttonReload = p5.createButton('refresh');
  buttonReload.class('material-icons mdc-icon-button sketch-button');
  buttonReload.parent(`actions-${sketchId}`);
  buttonReload.mousePressed(p5.reload);

  const buttonUpload = p5.createButton('present_to_all');
  buttonUpload.id(`sketch-${sketchId}-loading`)
  buttonUpload.class('sketch-button material-icons mdc-icon-button');
  buttonUpload.parent(`actions-${sketchId}`);
  buttonUpload.mousePressed(() => saveSketch(`sketch-${sketchId}`, canvasId));
}

new p5((p5) => {
  const sketchId = '1';

  p5.setup = function () {
    p5.pixelDensity(1)
    p5.createCanvas(320, 240);
    const canvasContainer = document.getElementById(`sketch-${sketchId}`);
    const canvas = canvasContainer?.children[0];

    createUi({
      p5, 
      canvasId: canvas?.id, 
      sketchId, 
      labelText: 'A'
    })
  };

  p5.draw = function () {
    p5.reload();
    p5.noLoop();
  };

  p5.reload = function () {
    let palette = p5.random(palettes);
    const bg = p5.random(palette);
    p5.background(bg);
    palette = palette.filter((c) => c != bg)
    p5.push()
    p5.translate(p5.width/2, p5.height/2)
    const d = p5.height - 10
    p5.strokeWeight(0.3)

    // Generate random points within a circle
    let points = [];
    [...Array(200)].forEach(() => {
      const theta = p5.TAU * Math.random();
      const r = p5.random(d/2)
      points.push(
        p5.createVector(
          p5.floor((r * Math.cos(theta))),
          p5.floor((r * Math.sin(theta)))
        )
      )
    })

    let delaunaySource = points.map(pt => [pt.x, pt.y]).flat(Infinity)  
    const triangulation = new Delaunator(delaunaySource)
    
    // Get the Delaunay triangles
    let triangles = []
    for (let i = 0; i < triangulation.triangles.length; i += 3) {
      triangles.push([
          points[triangulation.triangles[i]],
          points[triangulation.triangles[i + 1]],
          points[triangulation.triangles[i + 2]]
      ]);
    }

    // Draw the triangles
    triangles.forEach((t) => {
      p5.fill(p5.random(palette))
      p5.beginShape()
      p5.vertex(t[0].x, t[0].y)
      p5.vertex(t[1].x, t[1].y)
      p5.vertex(t[2].x, t[2].y)
      p5.endShape()
    })
    p5.pop()
  };
}, 'sketch-1');

new p5((p5) => {
  const sketchId = '2';

  p5.setup = function () {
    p5.pixelDensity(1)
    p5.createCanvas(320, 240);
    const canvasContainer = document.getElementById(`sketch-${sketchId}`);
    const canvas = canvasContainer?.children[0];
    p5.rectMode(p5.CENTER)
    p5grain.setup({instance: p5})

    createUi({
      p5, 
      canvasId: canvas?.id, 
      sketchId, 
      labelText: 'B'
    })
  };

  p5.draw = function () {
    p5.reload();
    p5.noLoop();
  };

  p5.reload = function () {
    let palette = p5.random(palettes);
    areas = []

    p5.background(p5.random(palette));
    let bg = p5.random(palette)
    palette.filter((c) => c != bg)
    p5.background(p5.random(palette))

    let boundary = new Rectangle(40, 10, 240, p5.height - 20)
    let qtree = new QuadTree(boundary, 4)

    ;[...Array(120)].forEach(() => {
      const pt = p5.createVector(
        p5.random(p5.width),
        p5.random(p5.height)
      )

      let ptBias = p5.createVector(
        randomBias(p5, 0, p5.width, pt.x),
        randomBias(p5, 0, p5.height, pt.y)
      )

      let p = new Point(ptBias.x, ptBias.y)
      qtree.insert(p)
    })

    qtree.show()
    areas.forEach((area) => {
      if (p5.random() > 0.5) {
        p5.fill(p5.random(palette))
        p5.stroke(p5.random(palette))
        p5.strokeWeight(p5.random(2, 4))
        p5.rect(
          area.x,
          area.y,
          area.w - 5,
          area.h - 5,
          3
        )
        p5.fill(p5.random(palette))
        p5.noStroke()
        p5.circle(
          area.x,
          area.y,
          area.w - 16
        )
      }
    })

    p5.granulateSimple(4)
  };
}, 'sketch-2');

function randomBias(p5, min, max, bias, influence = 0.5) {
  const base = p5.random(min, max);
  const mix = p5.random(0, 1) * influence;

  return base * (1 - mix) + bias * mix;
}


new p5((p5) => {
  const sketchId = '3';

  p5.setup = function () {
    p5.pixelDensity(1)
    p5.createCanvas(320, 240);
    const canvasContainer = document.getElementById(`sketch-${sketchId}`);
    const canvas = canvasContainer?.children[0];

    createUi({
      p5, 
      canvasId: canvas?.id, 
      sketchId, 
      labelText: 'X'
    })
  };

  p5.draw = function () {
    p5.reload();
    p5.noLoop();
  };

  p5.reload = function () {
    let palette = p5.random(palettes);
    const bg = p5.random(palette);
    p5.background(bg);

    const gridWidth = 320
    const gridHeight = 240
    let gridCellWidths = []
    let gridCellHeights = []
    let gridCellWidth, gridCellHeight
    let w = 0
    while (w < gridWidth) {
      if (p5.random() > 0.25) {
        gridCellWidth = p5.int(p5.random([4, 6]))
      } else {
        gridCellWidth = p5.int(p5.random([10, 20]))
      }

      if (w + gridCellWidth > gridWidth) {
        gridCellWidth = gridWidth - w
        gridCellWidths.push(gridCellWidth)
        break
      }
      gridCellWidths.push(gridCellWidth)
      w += gridCellWidth
    }
    
    let h = 0
    while (h < gridHeight) {
      if (p5.random() > 0.3) {
        gridCellHeight = p5.int(p5.random(4, 6))
      } else {
        gridCellHeight = p5.int(p5.random(20, 40))
      }

      if (h + gridCellHeight > gridHeight) {
        gridCellHeight = gridHeight - h
        gridCellHeights.push(gridCellHeight)
        break
      } 
      gridCellHeights.push(gridCellHeight)
      h += gridCellHeight
    }

    let cols = gridCellWidths.length
    let rows = gridCellHeights.length
    let cellX = 0;
    let cellY = 0;

    p5.strokeWeight(0.4)
    p5.stroke(p5.random(palette))

    ;[...Array(rows)].forEach((_, row) => {
      [...Array(cols)].forEach((_, col) => {
        const cellWidth = gridCellWidths[col]
        const cellHeight = gridCellHeights[row] 

        if (p5.random() > 0.8) {
        } else {
          p5.noFill()

          const c = p5.color(p5.random(palette))
          c.setAlpha(p5.map(col, cols, col  * 0.1, 255, 0))
          p5.fill(c)

          const s = p5.color('black')  
          s.setAlpha(p5.map(col, cols, col  * 0.1, 255, 0))
          p5.stroke(s)
          p5.drawRect({
            x: cellX + gridCellWidths[col]/2,
            y: cellY + gridCellHeights[row]/2,
            w: gridCellWidths[col],
            h: gridCellHeights[row],
            crossHatchAngle: p5.radians(p5.random([48, -42])),
            crossHatchSpacing: p5.random(2, 3)
          })

          const d = (cellWidth < cellHeight) ? cellWidth/2 : cellHeight/2
          if (p5.random() > 0.5) {
            const circleColour = p5.color(p5.random(palette))
            circleColour.setAlpha(p5.map(row, cols, row * 0.01, 255, 0))       
            p5.circle(
              cellX + cellWidth/2, 
              cellY + cellHeight/2, 
              (d - 1.5)  * 2)
          }
        }
        cellX += gridCellWidths[col]
      })

      cellX = 0
      cellY += gridCellHeights[row];
    })
  };

  p5.drawRect = function(opts) {
    const {
      x,
      y,
      w,
      h,
      cornerRadius = 0,
      crossHatchAngle = p5.radians(48),
      crossHatchSpacing = 2,
      padding = 0
    } = opts

    const maxW = p5.sqrt(p5.pow(w, 2) + p5.pow(h, 2))

    p5.push()
    p5.translate(x, y)
    // rotate the whole rectangle here
    p5.rect(-w/2, -h/2, w, h, cornerRadius)

    p5.push()
    p5.drawingContext.save()
    p5.noStroke()
    // inner radius = outer radius - padding
    if (cornerRadius > 0) {
      p5.rect(-w/2 + padding, -h/2 + padding, w - padding * 2, h - padding * 2, cornerRadius - padding)
    }

    p5.drawingContext.clip()
    p5.rotate(crossHatchAngle)
    p5.stroke('black')
    p5.strokeWeight(0.2)
    let lineY = -maxW/2
    while(lineY < maxW/2) {
      p5.line(-maxW/2, lineY, maxW/2, lineY)
      lineY += crossHatchSpacing
    }
    p5.drawingContext.restore()
    p5.pop()
    p5.pop()
  }

}, 'sketch-3');

new p5((p5) => {
  const sketchId = '4';
  let palette, w

  p5.setup = function () {
    p5.pixelDensity(1)
    p5.createCanvas(320, 240);
    const canvasContainer = document.getElementById(`sketch-${sketchId}`);
    const canvas = canvasContainer?.children[0];

    createUi({
      p5, 
      canvasId: canvas?.id, 
      sketchId, 
      labelText: 'Y'
    })
  };

  p5.draw = function () {
    p5.reload();
    p5.noLoop();
  };

  p5.reload = function () {
    palette = p5.random(palettes);
    const bg = p5.random(palette);
    p5.background(bg);

    let cellX, cellY
    let rows = 4
    let cols = 5
    // 16:9 aspect ratio
    const cellSizeW = 50
    const cellSizeH = cellSizeW
    w = cellSizeW/2.3
    const margin = 2
    const gridWidth = (cols * cellSizeW) + (2 * cols * margin) 
    const gridHeight = (rows * cellSizeH) + (2 * rows * margin) 
    const xOffset = (cellSizeW/2 + margin) +  (p5.width - gridWidth) / 2
    const yOffset =  (cellSizeH/2 + margin) + (p5.height - gridHeight) / 2

    p5.push()
    p5.translate(xOffset, yOffset);

    [...Array(rows)].forEach((val, row) => {
      cellY = (cellSizeH + (margin * 2)) * row;
      [...Array(cols)].forEach((val, col) => {
        cellX = (cellSizeW+ (margin * 2)) * col
        p5.push()
        p5.translate(cellX, cellY + w/4)
        p5.rotate(p5.radians(p5.random([0, 90, 180, 270])))
        p5.drawCell()    
        p5.pop()
      })
      cellX = 0
      p5.translate(0, 0)
    })
    p5.pop()
  };

  p5.drawCell = function() {
    p5.push()
    p5.drawCube()
    p5.translate(-w/2, -w/2 * p5.sin(p5.radians(30)))
    p5.drawCube()
    p5.translate(w/2, -w/2 * p5.sin(p5.radians(30)))
    p5.drawCube()
    p5.translate(w/2, w/2 * p5.sin(p5.radians(30)))
    p5.drawCube()
    p5.pop()
    p5.translate(0, -w/2)
    p5.push()
    p5.drawCube()
    p5.translate(-w/2, -w/2 * p5.sin(p5.radians(30)))
    p5.drawCube()
    p5.translate(w/2, -w/2 * p5.sin(p5.radians(30)))
    p5.drawCube()
    p5.translate(w/2, w/2 * p5.sin(p5.radians(30)))
    p5.drawCube()
    p5.pop()
  }

  p5.drawCube = function() {
    let filled = false
    if (p5.random() > 0.3) {
      p5.fill(p5.random(palette))
      filled = true
      p5.stroke('#222')
    } else {
      p5.noStroke()
      p5.noFill()
    }

    // Top
    p5.push()
    p5.beginShape()
    p5.vertex(0, w/2 * p5.sin(p5.radians(30)))
    p5.vertex(w/2,  0)
    p5.vertex(0, -w/2 * p5.sin(p5.radians(30)))
    p5.vertex(-w/2,  0)
    p5.endShape(p5.CLOSE)

    p5.translate(0, w/2 * p5.sin(p5.radians(30)))

    // Bottom
    p5.beginShape()
    p5.vertex(0, 0)
    p5.vertex(w/2, w/2 * p5.sin(p5.radians(30)))
    p5.vertex(0, w/2)
    p5.vertex(-w/2, w/2 * p5.sin(p5.radians(30)))  
    p5.endShape(p5.CLOSE)

    if (!filled) {
      p5.beginShape()
      p5.vertex(0, 0)
      p5.vertex(0, -w/2)
      p5.endShape(p5.CLOSE)
    }

    // Right front
    p5.beginShape()
    p5.vertex(0, 0)
    p5.vertex(0, w/2)
    p5.vertex(w/2, w/2 - w/2 * p5.sin(p5.radians(30)))
    p5.vertex(w/2, -w/2 * p5.sin(p5.radians(30)))  
    p5.endShape(p5.CLOSE)

    // Left front
    p5.beginShape()
    p5.vertex(0, 0)
    p5.vertex(0, w/2)
    p5.vertex(-w/2, w/2 - w/2 * p5.sin(p5.radians(30)))
    p5.vertex(-w/2, -w/2 * p5.sin(p5.radians(30)))  
    p5.endShape(p5.CLOSE)
    p5.pop()
  }
}, 'sketch-4');
