#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


// retourne un nombre random
float random (in vec2 st) { 
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233))) 
                * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( random( i + vec2(0.0,0.0) ), 
                     random( i + vec2(1.0,0.0) ), u.x),
                mix( random( i + vec2(0.0,1.0) ), 
                     random( i + vec2(1.0,1.0) ), u.x), u.y);
}

mat2 rotate2d(float angle){
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle));
}

float lines(in vec2 pos, float b){
    float scale = 10.992;
    pos *= scale*u_time;
    return smoothstep(0.0,
                    .5+b*.5,
                    abs((sin(pos.x*3.1415)+b*2.0))*.5);
}


// nombre d'itérations du bruit (octaves)
#define NUM_OCTAVES 15

// fractional brownian motion
float fbm ( in vec2 _st) {
    // luminosité ?
    float v = -1.088;
    float a = 1.764;
    
    vec2 shift = vec2(-0.260,-0.670);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.684), sin(0.5), 
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy/9.928;
    
    // animation de zoom et dézoom
    // st += st * abs(sin(u_time*0.05)*3.0);
    
    vec3 color = vec3(0.);
    
    // effet tâche
    // q ??
    vec2 q = vec2(0.);
    q.x = smoothstep(0.030*sin(u_time), 2.048, fbm(st*8.408));
    q.y = smoothstep(0.982*sin(u_time), 1.016, fbm(st*7.976));

    // r ??
    vec2 r = vec2(0.);
    // effet fumée
    // animation en fonction du temps, avec une indication de direction (vec2)
    r.x = fbm( st + 0.144 + vec2(0.590,0.700)+ 0.822);
    r.y = fbm( st + 1.392 + vec2(0.110,0.360)+ 0.550);

    // f ??
    float f = fbm(st+q);


    vec2 pos = st.yx*vec2(10.,3.);

    float pattern = pos.x;

    // Add noise
    pos = rotate2d( noise(pos) ) * pos;
    
    // Draw lines
    pattern = lines(pos,.5);    
    
    // trois couches de couleur différentes
    
    // couche 1 qui dépend de f
    color = mix(color,
                vec3(0.687,0.795,0.835),
                clamp((color)*3.632,0.0,1.0));

    // couche 2 qui dépend de q
    color = mix(color,
                vec3(0.985,0.979,0.936),
                clamp(length(q),0.0,1.0));

    // couche 3 qui dépend de r
    color = mix(color,
                vec3(0.980,0.970,0.860),
                clamp(length(r.x),0.0,1.0));
    
    
    gl_FragColor = vec4(vec3(color),1.784);
 
}