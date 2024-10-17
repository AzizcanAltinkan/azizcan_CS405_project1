function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {

    const transformationMatrix = new Float32Array([
        0.1767766922712326, -0.2866116464138031, 0.36959946155548096, 0.30000001192092896,
        0.3061862289905548, 0.36959946155548096, 0.1401650458574295, -0.25,
        -0.7071067690849304, 0.3535533845424652, 0.6123724579811096, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    
    
    
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
    
    /*translation:
		0.3 units in x-axis
		-0.25 units in y-axis*/
    const Translation = createTranslationMatrix(0.3, -0.25, 0); 



    /*scaling:
        0.5 by x-axis
        0.5 by y-axis*/
    const Scale = createScaleMatrix(0.5, 0.5, 1); 



    /*	rotation:
		30 degrees on x-axis
		45 degrees on y-axis
		60 degrees on z-axis*/

    const Angle_of_X = (30 * Math.PI) / 180;
    const Angle_of_Y = (45 * Math.PI) / 180; 
    const Angle_of_Z = (60 * Math.PI) / 180; 

    


    const Rotation_of_X = createRotationMatrix_X(Angle_of_X);
    const Rotation_of_Y = createRotationMatrix_Y(Angle_of_Y);
    const Rotation_of_Z = createRotationMatrix_Z(Angle_of_Z);


    let Prism = createIdentityMatrix();


    //Order is Rotation -> Scale -> Translation

    Prism = multiplyMatrices(Prism, Rotation_of_Z); 
    Prism = multiplyMatrices(Prism, Rotation_of_Y); 
    Prism = multiplyMatrices(Prism, Rotation_of_X); 


    Prism = multiplyMatrices(Prism, Scale);     

    Prism = multiplyMatrices(Prism, Translation);  

    return Prism;
}





/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
function getPeriodicMovement(startTime) {
    const currentTime = (Date.now() - startTime) / 1000; // Time in seconds
    const period = 10;
    const phaseTime = currentTime % period;

    // Interpolation factor (t) based on current phase
    let t;
    if (phaseTime < 5) {
        t = phaseTime / 5; // First 5 seconds, moving to target
    } else {
        t = (10 - phaseTime) / 5; // Last 5 seconds, returning to initial
    }

    // Initial and target matrices
    const initialMatrix = createIdentityMatrix();
    const targetMatrix = getModelViewMatrix();

    // Interpolating element-wise between the initial and target matrices
    let interpolatedMatrix = new Float32Array(16);
    for (let i = 0; i < 16; i++) {
        interpolatedMatrix[i] = initialMatrix[i] * (1 - t) + targetMatrix[i] * t;
    }
v
    return interpolatedMatrix;
}




