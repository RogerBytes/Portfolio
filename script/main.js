"use strict";

//?-------------  Déclaration des Imports  -----------------//


//*-------------  Déclaration des Variables  ---------------//

const device_type = detect_device_type().toString(),
  bean_box = document.getElementById("beanBox"),
  scroll_bean = document.querySelector("#scrollBean"),
  main_box = document.getElementById("mainBox"),
  main_box_height = main_box.scrollHeight,
  main_box_visible_height = main_box.clientHeight,
  main_box_overflow = main_box.scrollHeight - main_box.clientHeight,
  overflow_quotient = main_box.scrollHeight / main_box_visible_height,
  style = document.createElement("style");

var label_menu = document.getElementById("labelMenu");

document.head.appendChild(style);

//!-------------  Déclaration des Events  ------------------//


scroll_bean.onmousedown = function (event) {
  const rect = bean_box.getBoundingClientRect();

  // Offset initial
  let offset_y = event.clientY - scroll_bean.getBoundingClientRect().top;

  // Fonction pour le mouvement de glissement
  function on_mouse_move(event) {
    // Nouvelle coordonnée Y
    let new_top = event.clientY - rect.top - offset_y;

    // Empêcher scroll_bean de sortir de son parent
    new_top = Math.max(
      0,
      Math.min(new_top, rect.height - scroll_bean.offsetHeight - 4)
    );
    // Pour une raison que j'ignore j'ai du diminuer de 4px, sinon il s'arrête un peu avant

    // Nouvelle position Y
    scroll_bean.style.top = new_top + "px";

    scroll_to_percentage(main_box, scroll_bean_position());
  }

  // Mouvement et relâchement du curseur
  document.addEventListener("mousemove", on_mouse_move);
  document.onmouseup = function () {
    document.removeEventListener("mousemove", on_mouse_move);
    scroll_bean.onmouseup = null;
  };
};

scroll_bean.ondragstart = function () {
  return false;
};

main_box.addEventListener("scroll", function () {
  const scroll_percentage = calculate_scroll_percentage();
  const movable_height = bean_box.clientHeight - scroll_bean.offsetHeight;
  scroll_bean.style.top = (movable_height * scroll_percentage) / 100 + "px";
});

window.addEventListener("resize", adjust_bean_box_visibility);

// Forcer l'event ci-dessus
window.dispatchEvent(new Event("resize"));

scroll_bean.addEventListener("touchstart", function (event) {
    event.preventDefault();
    const rect = bean_box.getBoundingClientRect();

    // Utilisez le premier contact pour l'offset initial
    const touch = event.touches[0];
    let offset_y = touch.clientY - scroll_bean.getBoundingClientRect().top;

    // Fonction pour le mouvement de glissement
    function on_touch_move(event) {
      // Nouvelle coordonnée Y
      const touch = event.touches[0];
      let new_top = touch.clientY - rect.top - offset_y;

      // Empêcher scroll_bean de sortir de son parent
      new_top = Math.max(
        0,
        Math.min(new_top, rect.height - scroll_bean.offsetHeight - 4)
      );

      // Nouvelle position Y
      scroll_bean.style.top = new_top + "px";

      scroll_to_percentage(main_box, scroll_bean_position());
    }

    // Mouvement et relâchement du tactile
    document.addEventListener("touchmove", on_touch_move);
    document.addEventListener("touchend", function () {
      document.removeEventListener("touchmove", on_touch_move);
    });
  },
  { passive: false }
);

// Empêche le le tactile de scroller dans la navbar quand on touche bean_box et son contenu.
scroll_bean.addEventListener(
  "touchmove",
  function (event) {
    event.preventDefault();
  },
  { passive: false }
);

//!-------------  Instructions  ----------------------------//

document.body.classList.add(device_type.toLowerCase().replace(" ", "-"));
scroll_bean.style.height = `${100 / overflow_quotient}%`;
document.addEventListener("DOMContentLoaded", adjust_bean_box_visibility);

const scroll_percentage = calculate_scroll_percentage(); // Calculer le pourcentage de défilement actuel
const movable_height = bean_box.clientHeight - scroll_bean.offsetHeight;
scroll_bean.style.top = (movable_height * scroll_percentage) / 100 + "px";

if (main_box.scrollHeight <= main_box.clientHeight) {
  // S'il n'y a pas d'overflow, cacher bean_box
  bean_box.style.display = "none";
} else {
  // S'il y a de l'overflow, bean_box est visible
  bean_box.style.display = "block";
}

label_menu.textContent = "Accueil";

style.sheet.insertRule(
  `
  #mainBox::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }
`,
  style.sheet.cssRules.length
);

//?-------------  Déclaration des Fonctions  ---------------//

function detect_device_type() {
  const user_agent = navigator.userAgent;
  if (
    user_agent.match(/Macintosh|Windows|Linux|Gecko/i) &&
    !user_agent.match(/iPhone|iPad|iPod|Windows Phone|Android/i)
  ) {
    return `desktop`;
  } else if (
    user_agent.match(/iPhone|iPad|iPod|Windows Phone|Android|AppleWebKit/i)
  ) {
    return `mobile`;
  } else {
    return `unknown-device`;
  }
}

function scroll_bean_position() {
  // Obtenir la position 'top' de scroll_bean relative à bean_box
  const bean_top = scroll_bean.offsetTop;
  // Calculer la hauteur disponible pour le déplacement de scroll_bean
  // Hauteur totale de bean_box moins la hauteur de scroll_bean
  const movable_height = bean_box.clientHeight - scroll_bean.offsetHeight;
  // Calculer la position en pourcentage
  const position_percentage = (bean_top / movable_height) * 100;
  // Clamper la valeur entre 0 et 100 pour éviter de dépasser les limites
  return Math.min(Math.max(position_percentage, 0), 100);
}

function calculate_scroll_percentage() {
  const scroll_top = main_box.scrollTop;
  const scroll_height = main_box.scrollHeight;
  const clientHeight = main_box.clientHeight;

  // Le pourcentage de défilement est le rapport entre ce qui a déjà défilé et ce qui est défilable
  const scroll_percentage = (scroll_top / (scroll_height - clientHeight)) * 100;

  return scroll_percentage.toFixed(2); // Arrondi à deux décimales
}

function scroll_to_percentage(main_box_var, percentage) {
  const max_scroll_top = main_box_var.scrollHeight - main_box_var.clientHeight; // Max scroll_top value
  const scroll_top = (percentage / 100) * max_scroll_top; // Calcul de la position de défilement en pixels
  main_box_var.scrollTop = scroll_top; // Fait défiler mainBox à la position calculée
}

function adjust_bean_box_visibility() {
  const has_overflow = main_box.scrollHeight > main_box.clientHeight;
  const is_portrait = window.innerHeight > window.innerWidth;

  // Mettre à jour l'affichage de bean_box
  if (has_overflow && !is_portrait) {
    bean_box.style.display = "block";
  } else {
    bean_box.style.display = "none";
  }

  // Mettre à jour la visibilité de la barre de défilement native de mainBox
  if (is_portrait) {
    // En mode portrait, affichez la barre de défilement native
    style.sheet.insertRule(
      `
      #mainBox::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }
    `,
      style.sheet.cssRules.length
    );
  } else {
    // Cacher la barre de défilement native en mode paysage
    style.sheet.insertRule(
      `
      #mainBox::-webkit-scrollbar {
        width: 0px;
        height: 0px;
      }
    `,
      style.sheet.cssRules.length
    );
  }
}

//todo----------  TODO  ------------------------------------//

//*-------------  Zone Test  -------------------------------//

//*-------------  Fin  -------------------------------------//
