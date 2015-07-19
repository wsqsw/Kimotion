import THREE from 'threejs';
import effect from 'effect';
import conf from 'conf';
import * as frag from 'text!./shaders/particle.frag';
import * as vert from 'text!./shaders/vertex.vert';

let scene;
let camera;
let renderer;

let p = {
    system    : undefined,
    material  : undefined,
    geometry  : undefined,
    positions : undefined,
    colors    : undefined
};

export default class particles {
    constructor(gfx) {
        scene    = gfx.gl.scene;
        camera   = gfx.gl.camera;

        // set the background color
        gfx.gl.renderer.setClearColor( 0xEFE2BF );

        // attach this effect's stuff to gfx.gl so other mods can twist it to
        // their whims
        gfx.gl.particles = p;

        add_particle_system();
        position_camera();
    }
    update(gfx) {
        update_positions(gfx.depth);
    }
    destroy() {}
}

function get_uniforms() {
    return {
        near_color    : { type : 'c',  value : new THREE.Color( 0x4C2A3B ) },
        mid_color     : { type : 'c',  value : new THREE.Color( 0x36C6A2 ) },
        far_color     : { type : 'c',  value : new THREE.Color( 0xEFE2BF ) },
        particle_size : { type : 'f',  value : 2.0 },
        texture       : { type : 't',  value : THREE.ImageUtils.loadTexture('images/glow.png') },
        // mouse     : { type : 'v2', value : new THREE.Vector2() },
    };
}

function get_attributes() {
    return {
        //customColor  : { type : 'c',  value : null },
    };
}

// THREE.NoBlending
// THREE.NormalBlending
// THREE.AdditiveBlending
// THREE.SubtractiveBlending
// THREE.MultiplyBlending
// THREE.CustomBlending

function add_particle_system() {
    p.geometry = new THREE.BufferGeometry();
    p.material = new THREE.ShaderMaterial({
        uniforms       : get_uniforms(),
        attributes     : get_attributes(),
        vertexShader   : vert,
        fragmentShader : frag,
        blending       : THREE.NoBlending,
        depthTest      : false,
        transparent    : false,
    });
    add_particle_system_attributes( p.geometry, 640*480 );
    p.system = new THREE.PointCloud( p.geometry, p.material );
    p.system.sortParticles = false;
    scene.add( p.system );
}

function add_particle_system_attributes(geo, count) {
    p.positions  = get_initial_particle_positions(count);
    p.colors     = new Float32Array( count );
    geo.addAttribute( 'position'    , new THREE.BufferAttribute( p.positions , 3 ) );
}

function get_initial_particle_positions(count) {
    p.positions  = new Float32Array( count * 3 );
    let x, y, j;
    for (let i = 0; i < p.positions.length; i += 3) {

        j = Math.floor(i / 3);

        x = (j % 640);
        // y must be flipped since kinect's coordinate system has +y going down and threejs has +y going up.
        y = 480 - (Math.floor(j / 640));

        p.positions[i  ] = x;
        p.positions[i+1] = y;
        p.positions[i+2] = 0;
    }
    return p.positions;
}

function position_camera() {
    camera.position.x = conf.camera.x;
    camera.position.y = conf.camera.y;
    camera.position.z = conf.camera.z;
    camera.lookAt(conf.camera.origin);
}


function update_positions(depth) {
    let pos = p.geometry.attributes.position.array;
    let z = 0, j = 0;
    for (let i = 2; i < pos.length; i += 3) {
        j = Math.floor(i/3);
        z = depth[j];
        pos[i] = z;
    }
    p.geometry.attributes.position.needsUpdate = true;
}

// function update_colors(depth) {
//     let colors = p.geometry.attributes.customColor.array;
//     let z = 0;
//     for (let i = 0; i < colors.length; i += 1) {
//         z = depth[i] / 2048;
//         colors[i] = z;
//     }
//     p.geometry.attributes.customColor.needsUpdate = true;
// }

function NaNPositionError(message) {
    this.name = 'NaNPositionError';
    this.message = message || '';
}
NaNPositionError.prototype = Error.prototype;

function set_color(prop, c) {
    p.material.uniforms[prop].value = new THREE.Color(c.r/255, c.g/255, c.b/255);
}

function set_near_color(c) {
    set_color('near_color', c);
}

function set_far_color(c) {
    set_color('far_color', c);
}

function set_camera(axis, v) {
    camera.position[axis] = v;
    camera.lookAt(conf.camera.origin);
}

function set_camera_x(v) { set_camera('x', v); }
function set_camera_y(v) { set_camera('y', v); }
function set_camera_z(v) { set_camera('z', v); }

function set_particle_size(c) {
    p.material.uniforms.particle_size.value = c;
}