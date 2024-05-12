const URL_PREFIX = ''

const {createApp} = Vue

createApp({
  data() {

    const sketchItems = [
      {
        href: `${URL_PREFIX}/dist/sketches/octopus.html`,
        img: `${URL_PREFIX}/images/energy-octopus-preview.png`,
        alt: 'energy-octopus-preview',
        description: 'Energy Octopus'
      },
      {
        href: `${URL_PREFIX}/dist/split-screen/index.html`,
        img: `${URL_PREFIX}/images/split-screen-preview.png`,
        alt: 'split-screen-preview',
        description: 'Split Screen'
      },
      {
        href: `${URL_PREFIX}/dist/sketches/spring-pendulum.html`,
        img: `${URL_PREFIX}/images/spring-pendulum-preview.png`,
        alt: 'spring-pendulum-preview',
        description: 'Spring Pendulum'
      },

    ]

    const ccItems = [
      {
        href: `${URL_PREFIX}/dist/cc2.0/u2/rosetta-orbit.html`,
        img: `${URL_PREFIX}/images/rosetta-orbit-preview.png`,
        alt: 'rosetta-orbit-preview',
        description: 'Rosetta orbit'
      },
      {
        href: `${URL_PREFIX}/dist/cc2.0/u3/skewing.html`,
        img: `${URL_PREFIX}/images/skewing-preview.png`,
        alt: 'skewing-preview',
        description: 'Skewing'
      },
      {
        href: `${URL_PREFIX}/dist/cc2.0/u3/skewing-audio.html`,
        img: `${URL_PREFIX}/images/skewing-audio-preview.png`,
        alt: 'skewing-preview',
        description: 'Skewing: Audio'
      },
      {
        href: `${URL_PREFIX}/dist/cc2.0/u4/curves-intro.html`,
        img: `${URL_PREFIX}/images/curves-intro-preview.png`,
        alt: 'curves-intro-preview',
        description: 'Curves: intro'
      },
      {
        href: `${URL_PREFIX}/dist/cc2.0/u4/curves-grid.html`,
        img: `${URL_PREFIX}/images/curves-grid-preview.png`,
        alt: 'curves-grid-preview',
        description: 'Curves: grid'
      },
      {
        href: `${URL_PREFIX}/dist/cc2.0/u5/audio-tony.html`,
        img: `${URL_PREFIX}/images/audio-tony-preview.png`,
        alt: 'audio-tony-preview',
        description: 'Audio: Tony'
      },
      {
        href: `${URL_PREFIX}/dist/cc2.0/u5/audio-concentric.html`,
        img: `${URL_PREFIX}/images/audio-concentric-preview.png`,
        alt: 'audio-concentric-preview',
        description: 'Audio: Concentric'
      }
    ]
    const threejsItems = [
      {
        href: `${URL_PREFIX}/dist/three.js/selective-bloom/index.html`,
        img: `${URL_PREFIX}/images/threejs-selective-bloom-preview.png`,
        alt: 'three.js-selective-bloom-preview',
        description: '3js: Selective bloom'
      },
      {
        href: `${URL_PREFIX}/dist/three.js/traffic-light/index.html`,
        img: `${URL_PREFIX}/images/threejs-traffic-light-preview.png`,
        alt: 'three.js-traffic-light-preview',
        description: '3js: Traffic light'
      }
    ]

    return {
      sections: [
        {
          title: 'Sketches',
          items: sketchItems
        },
        {
          title: 'Creative coding 2.0: homework',
          items: ccItems
        },
        {
          title: 'THREE.js Playground',
          items: threejsItems
        }
      ]
    }
  }
}).mount('#app')
