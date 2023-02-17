
class BufferForm {
  constructor() {
    this.attribs = [];
    this.attribSize = 0;
  }
  
  addAttribute(name, size) {
    // By default these will be of type FLOAT
    this.attribs.push({
      name: name,
      size: size,
      offset: this.attribSize,
    });
    this.attribSize += size;
  }
  
  getAttribute(name) {
    return this.attribs.find(e => e.name == name);
  }
  
}

class Buffer extends BufferForm {
  constructor(gl, program) {
    super();
    this.gl = gl;
    this.program = program;
    this.data = {};
    this.DRAW_METHOD = gl.STATIC_DRAW;
    this.vertBuffer = gl.createBuffer();
    this.indxBuffer = gl.createBuffer();
    this.vertices = [];
    this.indices = [];
    this.lineVertices = [];
    this.lineIndices = [];
    this.colorAttrib = null;
    
    // Bind these buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indxBuffer);
  }
  
  saveAttribLocations() {
    for (let i in this.attribs) {
      let name = this.attribs[i].name;
      this.attribs[i].loc = this.gl.getAttribLocation(this.program, name);
    }
    
    this.setupAttribs();
  }
  
  setupAttribs(wireframe = false) {
    let gl = this.gl;
    let attribSize = this.attribSize;
    
    // Adjust size from missing color attribute
    // if (wireframe && this.colorAttrib != null) {
    //   attribSize -= this.colorAttrib.size;
    // }
    
    for (let i in this.attribs) {
      let attrib = this.attribs[i];
      
      // // Without except
      // if (wireframe && attrib.name == this.colorAttrib.name) {
      //   continue;
      // }
      
      // Point attributes
      gl.vertexAttribPointer(
        attrib.loc, // Attribute location
        attrib.size, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        attribSize * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertex
        attrib.offset * Float32Array.BYTES_PER_ELEMENT // Offset from beginning of a single vertex to this attribute
      );
      
      // Enable attributes
      gl.enableVertexAttribArray(attrib.loc);
    }
  }
  
  loadVertices() {
    let gl = this.gl;
    this.data.vertexArray = new Float32Array(this.vertices)
    this.data.indexArray = new Uint32Array(this.indices);
    this.data.lineIndexArray = new Uint32Array(this.lineIndices);
  }
  
  render() {
    let gl = this.gl;
    
    // Load buffers
    gl.bufferData(gl.ARRAY_BUFFER, this.data.vertexArray, gl.DYNAMIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.data.indexArray, gl.DYNAMIC_DRAW);
    
    // Render : TRIANGLES, vertexCount, TYPE, skip
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
  }
  
  setWireframeColorAttrib(name) {
    this.colorAttrib = this.getAttribute(name);
  }
  
  renderWireframe() {
    let gl = this.gl;
    
    if (this.colorAttrib != null) {
      gl.disableVertexAttribArray(this.colorAttrib.loc);
    }
    
    
    // Set line indices
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.data.lineIndexArray, gl.DYNAMIC_DRAW);
    
    // Set line width (doesn't work)
    // gl.lineWidth(4);
    
    // Line strip
    gl.drawElements(gl.LINE_STRIP, this.lineIndices.length, gl.UNSIGNED_INT, 0);
  }
  
}

class VertForm {
  // Takes in a buffer for typage
  constructor(buffer) {
    this.buffer = buffer;
    this.attribs = [];
  }
  
  // Takes in name and array of values
  setAttrib(name, values) {
    // Find by name
    let attrib = this.buffer.getAttribute(name);
    
    // Invalid attribute
    if (attrib == undefined) {
      console.error("ERROR: Attribute " + name + " not found!");
      return;
    }
    
    // Set values
    for (let i=0; i<attrib.size; i++) {
      this.attribs[attrib.offset + i] = values[i];
    }
  }
  
  setAttribs(...attribs) {
    // [name, value]
    for (let i in attribs) {
      let attrib = attribs[i];
      this.setAttrib(attrib[0], attrib.slice(1));
    }
  }
  
  getAttribs() {
    return this.attribs;
  }
  
  appendAttribs() {
    // Append vertex attributes
    this.buffer.vertices = [].concat.apply([], [this.buffer.vertices, this.attribs]);
  }
  
}

class GLTriangle {
  constructor(buffer) {
    this.buffer = buffer;
    this.vertices = [
      new VertForm(buffer),
      new VertForm(buffer),
      new VertForm(buffer)
    ];
  }
  
  getVertex(i) {
    return this.vertices[i];
  }
  
  appendAttribs() {
    for (let i=0; i<this.vertices.length; i++) {
      this.vertices[i].appendAttribs();
    }
    
    // Appending indices
    let indices = this.buffer.indices;
    let offset = indices.length;
    
    this.buffer.indices = [].concat.apply([], [this.buffer.indices, [
      offset + 0, offset + 1, offset + 2
    ]]);
    
  }
}

class GLShape {
  constructor(buffer, vertCount) {
    this.buffer = buffer;
    this.vertices = new Array(vertCount);
    this.vertCount = vertCount;
    for (let i=0; i<vertCount; i++) {
      this.vertices[i] = new VertForm(buffer);
    }
  }
  
  getVertex(i) {
    return this.vertices[i];
  }
  
  appendAttribs() {
    let offset = this.buffer.vertices.length / this.buffer.attribSize;
    for (let i=0; i<this.vertices.length; i++) {
      this.vertices[i].appendAttribs();
    }
    
    // Appending indices
    let indices = [];
    let lineIndices = [];
    let vertCount = offset + this.vertices.length;
    
    // Number of tris = vertCount - 2
    for (let i=1; i<this.vertCount-1; i++) {
      let a = offset+0, b = offset+i, c = offset+i+1;
      indices.push(a, b, c);
      
      // Create wireframe indices array
      lineIndices.push(a, b % vertCount);
      lineIndices.push(b % vertCount, c % vertCount);
    }
    
    // Set index arrays
    this.buffer.indices = [].concat.apply([], [this.buffer.indices, indices]);
    this.buffer.lineIndices = lineIndices;
    
    // Normal outline
    // for (let i=0; i<vertCount; i++) {
    //   lineIndices.push(i, (i+1) % vertCount);
    // }
  }
}

/*

































*/
