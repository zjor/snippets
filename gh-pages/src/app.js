const URL_PREFIX = ''

const {createApp} = Vue

createApp({
  data() {
    return {
      items: [
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
    }
  }
}).mount('#app')
