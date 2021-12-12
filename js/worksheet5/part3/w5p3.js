var gl;
var points = [];
var colors = [];
var numVertices;

var numTimesToSubdivide = 6;
var index = 0;
var pointsArray = [];
var normalsArray = [];

var near = 1;
var far = 10;
var fovy = 45.0;
var aspect;

var mvMatrix, pMatrix;
var modelView, projection, modelViewMatrix;
var modelLocation, loc, normalMatrixLoc, lightPos, aProduct, dProduct, sProduct;



var ctm;
var ambientColor, diffuseColor, specularColor;



var ambientProduct;
var diffuseProduct;
var specularProduct;

var theta = 0.0;
var phi = 0.0;

var thetaLoc;

var g_objDoc = null;      // Info parsed from OBJ file
var g_drawingInfo = null; // Info for drawing the 3D model with WebGL
var program;
scale = 1.0;




window.onload = function init(){
  canvas = document.getElementById("gl-Canvas");
  gl = WebGLUtils.setupWebGL(canvas);

  if(!gl){
    alert("WebGL not available");
  }

   gl.viewport( 0, 0, canvas.width, canvas.height );
   aspect =  canvas.width/canvas.height;
   gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);


   gl.enable(gl.DEPTH_TEST);
   gl.enable(gl.CULL_FACE);

   program = initShaders( gl, "vertex-shader", "fragment-shader" );
   gl.useProgram( program );
  // orbit = true;
   //createSphere(gl, program);





   var increment = document.getElementById("buttonInc");
   var decrement = document.getElementById("buttonDec");
    var orbit_btn = document.getElementById("orbit");



   increment.onclick = function(){
     console.log("incrementing");
    numTimesToSubdivide++;
    index = 0;
    pointsArray = [];
    normalsArray = [];

  //  createSphere(gl, program);


    };

    decrement.onclick = function(){
      console.log("decrementing");
        numTimesToSubdivide--;
        index = 0;
        pointsArray = [];
        normalsArray = [];

        createSphere(gl, program);

    };
/*
    orbit_btn.onclick = function(){

      orbit = !orbit;
      if(orbit) render();

    //  render();


    //createSphere(gl, program);
    };
    */


    model = initObject(gl, "../models/teapot.obj", scale);
  //  readOBJFile("teapot.obj", gl, model, scale, true);

   render();
};

function initObject(gl, obj_filename, scale){
  gl.program.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.program.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  gl.program.a_Color = gl.getAttribLocation(gl.program, 'a_Color');

  // Prepare empty buffer objects for vertex coordinates, colors, and normals
  var model = initVertexBuffers(gl);

  // Start reading the OBJ file
  readOBJFile(obj_filename, gl, model, scale, true);
  return model;
}

// Create a buffer object and perform the initial configuration
function initVertexBuffers(gl, program) {
  var o = new Object();
  o.vertexBuffer = createEmptyArrayBuffer(gl, program.a_Position, 3, gl.FLOAT);
  o.normalBuffer = createEmptyArrayBuffer(gl, program.a_Normal, 3, gl.FLOAT);
  o.colorBuffer = createEmptyArrayBuffer(gl, program.a_Color, 4, gl.FLOAT);
  o.indexBuffer = gl.createBuffer();

  return o;
}


function createEmptyArrayBuffer(gl, a_attribute, num, type) {
  var buffer = gl.createBuffer(); // Create a buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute); // Enable the assignment

  return buffer;
}

// Read a file
function readOBJFile(fileName, gl, model, scale, reverse) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status !== 404) {
      onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
    }
  }
  request.open('GET', fileName, true); // Create a request to get file
  request.send(); // Send the request
}


// OBJ file has been read
function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
  var objDoc = new OBJDoc(fileName); // Create a OBJDoc object
  var result = objDoc.parse(fileString, scale, reverse);
  if (!result) {
    g_objDoc = null; g_drawingInfo = null;
    console.log("OBJ file parsing error.");
    return;
  }
  g_objDoc = objDoc;
}

// OBJ File has been read completely
function onReadComplete(gl, model, objDoc) {
  // Acquire the vertex coordinates and colors from OBJ file
  var drawingInfo = objDoc.getDrawingInfo();

  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices,gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

  return drawingInfo;
}


function render() {

  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var radius = 0.001;
  theta += 0.02;

  var eye = vec3(radius * Math.sin(theta), 0.0, radius * Math.cos(theta));
//  eye = vec3(radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));


  const at = vec3(0.0, 0.0, 0.0);
  const up = vec3(0.0, 1.0, 0.0);

  /*
    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrix = mult( modelViewMatrix, translate( 0.0, 0.0, -1.0 ) );
    modelViewMatrix = mult(modelViewMatrix, rotate(spinY, [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(spinX, [1, 0, 0]));
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];
    */


  mvMatrix = lookAt(eye, at , up);
  pMatrix = perspective(fovy, aspect, near, far);
  loc = translate(0.0, 0.0,-1.8);
  var viewMatrix = mult(loc, mvMatrix);

//  gl.uniformMatrix4fv(modelLocation, false, flatten(loc));
  gl.uniformMatrix4fv( modelView, false, flatten(viewMatrix) );
//  gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

  if (!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete()) {
    // OBJ and all MTLs are available
    g_drawingInfo = onReadComplete(gl, model, g_objDoc);
  }
  if (!g_drawingInfo) {
    requestAnimationFrame(render);
    return;
  }

  gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);

  window.requestAnimFrame(render);
};
