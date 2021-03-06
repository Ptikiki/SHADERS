#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


// retourne un nombre random
float random (in vec2 _st) { 
    return fract(sin(dot(_st.xy,
                         vec2(-0.140,0.030)))* 
        43758.5453123);
}


float noise (in vec2 _st) {
    // partie integer de chaque fragment
    vec2 i = floor(_st);
    // partie fractional de chaque fragment
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    // grille
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + 
            (c - a)* u.y * (1.000 - u.x) + 
            (d - b) * u.x * u.y;
}


// nombre d'itérations du bruit (octaves)
#define NUM_OCTAVES 15

// fractional brownian motion
float fbm ( in vec2 _st) {
    // luminosité ?
    float v = 0.072;
    float a = 0.636;
    
    vec2 shift = vec2(-0.410,0.370);
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
    vec2 st = gl_FragCoord.xy/u_resolution.xy*3.;
    
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
    r.x = fbm( st + 0.144*q + vec2(0.590,0.700)+ 0.822);
    r.y = fbm( st + 1.392*q + vec2(0.110,0.360)+ 0.550);

    // f ??
    float f = fbm(st+q);

    // trois couches de couleur différentes
    
    // couche 1 qui dépend de f
    color = mix(vec3(0.360,0.360,0.840),
                vec3(0.980,0.512,0.665),
                clamp((f*f)*3.632,0.0,1.0));

    // couche 2 qui dépend de q
    color = mix(color,
                vec3(0.166,0.267,0.355),
                clamp(length(q),0.0,1.0));

    // couche 3 qui dépend de r
    color = mix(color,
                vec3(0.009,0.273,0.365),
                clamp(length(r.x),0.0,1.0));
    
    // application des couleurs et opacité
    gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color,0.8);
}