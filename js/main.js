(function($) {
  "use strict";

  // Build supplier index for global search
  let supplierIndex = {};

  function buildSupplierIndex() {
    supplierIndex = {};
    document.querySelectorAll('.single_page').forEach((pageElem, idx) => {
      const pageNum = idx + 1;
      pageElem.querySelectorAll('.card').forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        if (name) supplierIndex[name] = pageNum;
      });
    });
  }

  function initOwlCarousel() {
    $(".owl-carousel").each(function () {
      const $carousel = $(this);
       // Cas spécial : carrousel contenant uniquement la carte "danone Eaux"
    if ($carousel.find('.card[data-name="danone Eaux"]').length > 0) {
      $carousel.owlCarousel({
        loop: false,
        margin: 16,
        nav: true,
        items: 1,
        slideBy: 1,
        dots: false,
        smartSpeed: 500,
        navText: [
          '<img src="img/arrow-left.png" alt="Prev">',
          '<img src="img/arrow-right.png" alt="Next">'
        ]
      });
      return; // Empêche l'initialisation par défaut
    }
      const isAccueilOrFournisseurs = $carousel.hasClass("accueil-carousel") || $carousel.hasClass("fournisseurs-carousel");
      
  
      $carousel.owlCarousel({
        loop: false,
        margin: 16,
        autoWidth: false,
        autoplay: !isAccueilOrFournisseurs,
        autoplayTimeout: 10000,
        autoplayHoverPause: true,
        items: 2,
        slideBy: 2,
        dots: false,
        nav: true,
        smartSpeed: 500,
        navText: [
          '<img src="img/arrow-left.png" alt="Prev">',
          '<img src="img/arrow-right.png" alt="Next">'
        ],
        responsive: {
          0:    { items: 2, slideBy: 2 },
          576:  { items: 2, slideBy: 2 },
          768:  { items: 2, slideBy: 2 },
          992:  { items: 2, slideBy: 2 },
          1200: { items: 2, slideBy: 2 }
        }
      });
  
      // Toujours afficher les flèches  
      $carousel.on('initialized.owl.carousel', function(event) {
        $carousel.find('.owl-nav').show();
      });
    });
  }

  function attachSearchFiltering() {
    document.querySelectorAll(".search_form").forEach(form => {
      const input = form.querySelector("input[type='text']");
      const page  = form.closest(".single_page");
      const items = page.querySelectorAll(".item");

      input.addEventListener("input", function () {
        const query = this.value.trim().toLowerCase();

        items.forEach(item => {
          const name = (item.querySelector(".card").dataset.name || "").toLowerCase();
          item.style.display = name.includes(query) ? "" : "none";
        });

        const owl = $(page).find('.owl-carousel');
        owl.trigger('refresh.owl.carousel');

      });
    });
  }

  function attachGlobalSearch() {
    document.querySelectorAll('.search_form input[type="text"]').forEach(input => {
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        const query = this.value.trim().toLowerCase();
        const card = Array.from(document.querySelectorAll('.card'))
          .find(c => (c.dataset.name || '').toLowerCase().includes(query));
        if (card) {
          const pageNum = parseInt(card.dataset.page, 10);
          $('.flipbook').turn('page', pageNum);
        }
      });
    });
  }

  $(document).ready(function () {
    attachSearchFiltering();
    buildSupplierIndex();
    $('.single_page').each(function(idx, pageElem) {
      const pageNum = idx + 1;
      $(pageElem).find('.card').attr('data-page', pageNum);
    });
    attachGlobalSearch();
  });

  $(window).on("load", function () {
    initOwlCarousel();
  });

  $(".flipbook").turn({
    autoCenter: true,
    when: {
      turned: function(event, page, view) {
        initOwlCarousel();
        attachSearchFiltering();
        buildSupplierIndex();
        $('.single_page').each(function(idx, pageElem) {
          const pageNum = idx + 1;
          $(pageElem).find('.card').attr('data-page', pageNum);
        });
        attachGlobalSearch();
      }
    }
  });

  $(document).on("click", ".goto-page", function (e) {
    e.preventDefault();
    var page = $(this).data("page");
    if ($(".flipbook").turn("hasPage", page)) {
      $(".flipbook").turn("page", page);
    }
  });
  const categories = [
    "accueil",
    "boissons",
    "alimentaire",
    "entretien",
    "equipement",
    "ressources_humaines",
    "services",
    "distributeurs",
    "produits_d’accueil",
    "vêtements_professionnels",
    "produits_frais",
    "boulangerie_&_pâtisserie",
    "produits_prestige",
    "produits_bio",
    "industriels_alimentaires",
    "epicerie",
    "petit-déjeuner",
    "produits_laitiers",
    "distributeurs_de_boissons",
    "alcools",
    "spiritueux",
    "cocktails",
    "champagne",
    "vins",
    "bière&cidre",
    "soft",
    "industriels_boissons_soft",
    "eau_minérale",
    "eau_filtrée",
    "cafés&thés",
    "architecte_&_rénovation",
    "arts_de_la_table",
    "linge,_tissus_&_rideaux",
    "chambre_&_literie",
    "luminaires_&_electricité",
    "mobilier",
    "equipement_pour_la_restauration",
    "blanchisserie_&_location_de_linge",
    "dératisation,_désinfection_&_désinsectisation",
    "produits_d’entretien_&_d’hygiène",
    "accessoires_de_chambres",
    "serrures,_contrôles_d’accès_&_vidéo_surveillance",
    "ascenseurs,_elévateurs_&_monte-charge",
    "automobile",
    "energies,_gaz_&_electricité",
    "equipement_sanitaires_&_accessoires",
    "matériels_de_blanchisserie",
    "téléphonie,_wifi_&_courant_porteur",
    "télévisions_&_multimédia",
    "assurances_&_banques",
    "démarche_rse",
    "solutions_digitales",
    "qualité_&_sécurité_alimentaire",
    "abonnement_télévisuel",
    "télephonie,_wifi,_courant_porteur",
    "bureautique_&_papeterie",
    "conseil_aux_professionnels_du_chr",
    "recrutement"
  ];
  
  categories.forEach(category => {
    fetch(`data/vendors_${category}.json`)
      .then((res) => res.json())
      .then((vendors) => {
        const carousel = document.querySelector(`.${category}-carousel`);
        if (!carousel) return;
        vendors.forEach((vendor) => {
          const html = `
            <div class="item">
              <div class="card card_sm" data-name="${vendor.Nom}">
                <div class="card_logo">
                  <a href="${vendor.Lien}" target="_blank">
                    <img src="${vendor.Logo}" alt="Logo" />
                  </a>
                </div>
                <div class="card_body">
                  <p class="card_title">${vendor.Description}</p>
                  <div class="card_footer">
                    <span class="dot red"></span>
                    <h5>Mercuriale</h5>
                    <span class="dot gold"></span>
                    <h6>${vendor.RFA}</h6>
                  </div>
                </div>
              </div>
            </div>`;
          carousel.insertAdjacentHTML("beforeend", html);
        });
      });
  });
  document.addEventListener("DOMContentLoaded", function () {
    const sections = ["accueil", "boisson", "entretien", "equipement", "rh", "service"];
    
    sections.forEach(section => {
      fetch(`/api/fournisseurs/${section}`)
        .then(response => response.json())
        .then(data => {
          const container = document.querySelector(`.${section}-carousel`);
          if (container && Array.isArray(data)) {
            data.forEach(fournisseur => {
              const item = document.createElement('div');
              item.classList.add('item');
  
              item.innerHTML = `
                <div class="card" data-name="${fournisseur.name.toLowerCase()}">
                  <div class="card_logo">
                    <a href="https://www.cadhi.fr/vendor/${fournisseur.name.replace(/\s+/g, '')}" target="_blank">
                      <img src="img/Logos/${section.charAt(0).toUpperCase() + section.slice(1)}/${fournisseur.name}.png" alt="${fournisseur.name}" />
                    </a>
                  </div>
                </div>
              `;
              container.appendChild(item);
            });
  
            // Re-initialiser owlCarousel après ajout dynamique
            $(container).owlCarousel({
              items: 3,
              loop: true,
              margin: 10,
              nav: true
            });
          }
        })
        .catch(error => console.error(`Erreur chargement ${section}:`, error));
    });
  });
  
})(jQuery);
