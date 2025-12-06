const bg_da = {
  "layer-top": {
    img: "Images/bunw.png",
    transform: "scale(1.5) translateY(-5%)"
  },
  "layer-lettuce": {
    img: "Images/letw.png",
    transform: "scale(1.89) translateY(16%)"
  },
  "layer-cheese": {
    img: "Images/cheesew.png",
    transform: "scale(1.5) translateY(5%)"
  },
  "layer-patty": {
    img: "Images/pattyw.png",
    transform: "scale(1.55) translateY(0%)"
  },
  "layer-bottom": {
    img: "Images/botw.png",
    transform: "scale(1.4) translateY(10%)"
  }
};

const la = [
  "layer-top",
  "layer-lettuce",
  "layer-cheese",
  "layer-patty",
  "layer-bottom"
];

document.addEventListener("DOMContentLoaded", () => {

  const op = {
    root: null,
    threshold: 0.5,
    rootMargin: "0px"
  };

  let cu_la = null;

  const ob = new IntersectionObserver((en) => {
    en.forEach(en_i => {
      if (en_i.isIntersecting) {
        const id = en_i.target.id;
        console.log("Burger BG Stage:", id);

        if (id === 'viz1' || id === 'viz2') {
          if (cu_la !== 'layer-top') {
            cu_la = 'layer-top';
            sh_la('layer-top');
          }
        }

        else if (id === 'viz3' || id === 'viz4') {
          if (cu_la !== 'layer-lettuce') {
            cu_la = 'layer-lettuce';
            sh_la('layer-lettuce');
          }
        }

        else if (id === 'viz5_div' || id === 'viz6_div') {
          if (cu_la !== 'layer-cheese') {
            cu_la = 'layer-cheese';
            sh_la('layer-cheese');
          }
        }

        else if (id === 'viz7') {
          if (cu_la !== 'layer-patty') {
            cu_la = 'layer-patty';
            sh_la('layer-patty');
          }
        }

        else if (
          id === 'viz9' ||
          id === 'intro' ||
          id === 'outro'
        ) {
          if (cu_la !== 'layer-patty') {
            cu_la = 'layer-patty';
            sh_la('layer-patty');
          }
        }

        else if (id === 'viz10') {
          if (cu_la !== 'layer-bottom') {
            cu_la = 'layer-bottom';
            sh_la('layer-bottom');
          }
        }

        else if (id === 'viz11' || id === 'thankyouPage') {
          if (cu_la !== 'full') {
            cu_la = 'full';
            sh_fu();
          }
        }
      }
    });
  }, op);


  const ta = [
    '#viz1', '#viz2', '#viz3', '#viz4', '#viz5_div',
    '#viz6_div', '#viz7', '#viz9', '#viz10', '#viz11',
    '#thankyouPage', '#intro'
  ];

  ta.forEach(se => {
    const el = document.querySelector(se);
    if (el) {
      ob.observe(el);
    } else {
      console.warn("Element not found:", se);
    }
  });

  sh_fu();
});



function sh_fu() {
  const bg = document.getElementById("image-bg");
  if (!bg) return;

  bg.style.opacity = "0";
  bg.style.backgroundImage = "none";
  bg.style.transform = "scale(1) translateY(0)";

  la.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.opacity = "1";
      el.style.transform = "scale(1) translateY(0)";
      el.style.pointerEvents = "none";
    }
  });
}


function sh_la(id) {
  const to_la = ["layer-top", "layer-lettuce", "layer-cheese"];
  const bo_la = ["layer-patty", "layer-bottom"];

  const bg = document.getElementById("image-bg");
  if (!bg) return;

  if (bg_da[id]) {
    bg.style.backgroundImage = `url('${bg_da[id].img}')`;
    bg.style.opacity = "0.4";
    bg.style.transform = bg_da[id].transform;
  }

  la.forEach(lr => {
    const el = document.getElementById(lr);
    if (!el) return;

    if (lr === id) {
      el.style.opacity = "1";

      if (to_la.includes(id)) {
        el.style.transform = "scale(3.5)";
      } else if (bo_la.includes(id)) {
        el.style.transform = "scale(3.5) translateY(-25%)";
      }

      setTimeout(() => {
        el.style.opacity = "0";
      }, 1000);

    } else {
      el.style.opacity = "0";
      el.style.transform = "scale(1) translateY(0)";
    }
  });
}
