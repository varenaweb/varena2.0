(() => {
  const root = document.getElementById("menu-app");
  if (!root) return;

  const slug = root.dataset.slug;
  const cloudName = root.dataset.cloudName;
  const uploadPreset = root.dataset.uploadPreset;
  const canUpload =
    root.dataset.canUpload === "1" && typeof window.cloudinary !== "undefined" && cloudName && uploadPreset;
  const baseFolder = `menus/${slug}`;

  let menu = normalizeMenu(JSON.parse(root.dataset.menu || "{}"));
  let dirty = false;

  const sectionsContainer = document.getElementById("sections-container");
  const notesContainer = document.getElementById("notes-container");
  const statusEl = document.getElementById("save-status");

  const generalInputs = Array.from(root.querySelectorAll("[data-field]"));
  const brandingInputs = Array.from(root.querySelectorAll("[data-branding]"));
  const contactInputs = Array.from(root.querySelectorAll("[data-contact]"));

  const logoPreview = root.querySelector('[data-preview-target="branding.logoUrl"]');
  const heroPreview = root.querySelector('[data-preview-target="branding.heroImage"]');
  const logoInput = root.querySelector('[data-branding="logoUrl"]');
  const heroInput = root.querySelector('[data-branding="heroImage"]');

  function normalizeMenu(data) {
    const branding = data.branding || {};
    const contact = branding.contact || {};
    return {
      name: data.name || "",
      currency: data.currency || "ARS",
      taxNote: data.taxNote || "Sin impuestos nacionales:",
      taxRate: typeof data.taxRate === "number" ? data.taxRate : 21,
      branding: {
        tagline: branding.tagline || "",
        description: branding.description || "",
        primaryColor: branding.primaryColor || "#111827",
        secondaryColor: branding.secondaryColor || "#2563EB",
        accentColor: branding.accentColor || "#F97316",
        logoUrl: branding.logoUrl || "",
        heroImage: branding.heroImage || "",
        contact: {
          address: contact.address || "",
          phone: contact.phone || "",
          whatsapp: contact.whatsapp || "",
          instagram: contact.instagram || "",
        },
      },
      sections: Array.isArray(data.sections) ? data.sections : [],
      notes: Array.isArray(data.notes) ? data.notes : [],
    };
  }

  function markDirty() {
    dirty = true;
    setStatus("Tienes cambios sin guardar.", "info");
  }

  function setStatus(message, variant = "info") {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.dataset.variant = variant;
  }

  function setPreviewLink(link, url) {
    if (!link) return;
    if (url) {
      link.href = url;
      link.textContent = "Ver";
      link.classList.remove("disabled");
    } else {
      link.href = "#";
      link.textContent = "Sin imagen";
      link.classList.add("disabled");
    }
  }

  function openUploader(subfolder, onSuccess) {
    if (!canUpload) {
      alert("La subida de imágenes no está disponible. Configurá Cloudinary en el servidor.");
      return;
    }
    const folder = subfolder ? `${baseFolder}/${subfolder}` : baseFolder;
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        folder,
        multiple: false,
        sources: ["local", "url"],
        resourceType: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error", error);
          setStatus("No se pudo subir la imagen.", "error");
          return;
        }
        if (result && result.event === "success" && typeof onSuccess === "function") {
          onSuccess(result.info.secure_url);
          widget.close();
          setStatus("Imagen subida correctamente. Recordá guardar el menú.", "success");
        }
      }
    );
    widget.open();
  }

  function bindGeneralInputs() {
    generalInputs.forEach((input) => {
      const field = input.dataset.field;
      if (!field) return;
      input.value = menu[field] || "";
      input.addEventListener("input", (event) => {
        if (field === "taxRate") {
          const parsed = Number(event.target.value);
          menu[field] = Number.isFinite(parsed) ? parsed : 0;
          markDirty();
          renderSections();
        } else {
          menu[field] = event.target.value;
          markDirty();
        }
      });
    });
  }

  function bindBrandingInputs() {
    brandingInputs.forEach((input) => {
      const field = input.dataset.branding;
      if (!field) return;
      input.value = menu.branding[field] || "";
      input.addEventListener("input", (event) => {
        menu.branding[field] = event.target.value;
        if (field === "logoUrl") {
          setPreviewLink(logoPreview, event.target.value);
        }
        if (field === "heroImage") {
          setPreviewLink(heroPreview, event.target.value);
        }
        markDirty();
      });
    });
  }

  function bindContactInputs() {
    contactInputs.forEach((input) => {
      const field = input.dataset.contact;
      if (!field) return;
      input.value = menu.branding.contact[field] || "";
      input.addEventListener("input", (event) => {
        menu.branding.contact[field] = event.target.value;
        markDirty();
      });
    });
  }

  function initBrandingUploadButtons() {
    setPreviewLink(logoPreview, menu.branding.logoUrl);
    setPreviewLink(heroPreview, menu.branding.heroImage);
    const buttons = Array.from(root.querySelectorAll(".upload-trigger"));
    buttons.forEach((button) => {
      if (!canUpload) {
        button.disabled = true;
        button.title = "Subida deshabilitada. Configurá Cloudinary.";
        return;
      }
      const folder = button.dataset.uploadFolder || "";
      button.addEventListener("click", () => {
        const target = button.dataset.uploadTarget;
        if (target === "branding.logoUrl") {
          openUploader(folder, (url) => {
            menu.branding.logoUrl = url;
            if (logoInput) logoInput.value = url;
            setPreviewLink(logoPreview, url);
            markDirty();
          });
        } else if (target === "branding.heroImage") {
          openUploader(folder, (url) => {
            menu.branding.heroImage = url;
            if (heroInput) heroInput.value = url;
            setPreviewLink(heroPreview, url);
            markDirty();
          });
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function calcNetPrice(price) {
    if (typeof price !== "number" || Number.isNaN(price)) {
      return null;
    }
    const tax = Number(menu.taxRate);
    const multiplier = Number.isFinite(tax) ? 1 + tax / 100 : 1.21;
    if (multiplier <= 0) return null;
    return price / multiplier;
  }

  function formatCurrency(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return "";
    const currency = menu.currency || "ARS";
    const locale = currency.toUpperCase() === "USD" ? "en-US" : "es-AR";
    try {
      return value.toLocaleString(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      });
    } catch (_e) {
      return `${currency} ${value.toFixed(2)}`;
    }
  }

  function updateItemNetPreview(element, price) {
    if (!element) return;
    const value = calcNetPrice(price);
    if (value === null) {
      element.textContent = "";
      element.classList.add("hidden");
    } else {
      element.textContent = `${menu.taxNote || "Sin impuestos:"} ${formatCurrency(value)}`;
      element.classList.remove("hidden");
    }
  }

  function renderSections() {
    sectionsContainer.innerHTML = "";
    menu.sections.forEach((section, sectionIndex) => {
      if (!section.key) {
        section.key = `categoria-${sectionIndex + 1}-${Date.now()}`;
      }
      section.items = Array.isArray(section.items) ? section.items : [];
      const details = document.createElement("details");
      details.className = "section-card";
      details.open = true;
      details.dataset.sectionIndex = sectionIndex.toString();
      details.innerHTML = `
        <summary>
          <div>
            <input type="text" class="section-title" value="${escapeHtml(section.title || "")}" placeholder="Nombre de la categoría">
            <small>ID interno: ${escapeHtml(section.key || `categoria-${sectionIndex + 1}`)}</small>
          </div>
          <button type="button" class="btn btn-light" data-action="remove-section">Eliminar</button>
        </summary>
        <label>
          Descripción
          <textarea class="section-description" rows="2" placeholder="Descripción breve">${escapeHtml(section.description || "")}</textarea>
        </label>
        <div class="items-container"></div>
        <button type="button" class="btn btn-outline add-item" data-action="add-item">+ Agregar ítem</button>
      `;
      sectionsContainer.appendChild(details);

      const titleInput = details.querySelector(".section-title");
      const descInput = details.querySelector(".section-description");
      titleInput.addEventListener("input", (event) => {
        section.title = event.target.value;
        markDirty();
      });
      descInput.addEventListener("input", (event) => {
        section.description = event.target.value;
        markDirty();
      });

      const itemsContainer = details.querySelector(".items-container");
      renderItems(section, sectionIndex, itemsContainer);

      details.querySelector("[data-action='remove-section']").addEventListener("click", () => {
        if (!confirm("¿Eliminar esta categoría?")) return;
        menu.sections.splice(sectionIndex, 1);
        renderSections();
        markDirty();
      });

      details.querySelector("[data-action='add-item']").addEventListener("click", () => {
        section.items = Array.isArray(section.items) ? section.items : [];
        section.items.push(createEmptyItem(section));
        renderSections();
        markDirty();
      });
    });

    if (menu.sections.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent = "No hay categorías. Agregá la primera con el botón de arriba.";
      sectionsContainer.appendChild(emptyState);
    }
  }

  function renderItems(section, sectionIndex, container) {
    container.innerHTML = "";
    (section.items || []).forEach((item, itemIndex) => {
      const card = document.createElement("div");
      card.className = "item-card";
      card.dataset.itemIndex = itemIndex.toString();
      card.innerHTML = `
        <div class="item-card-head">
          <h3>Ítem ${itemIndex + 1}</h3>
          <button type="button" class="btn btn-light" data-action="remove-item">Eliminar</button>
        </div>
        <label>
          Nombre
          <input type="text" class="item-name" value="${escapeHtml(item.name || "")}" placeholder="Ej: Plato especial">
        </label>
        <label>
          Descripción
          <textarea class="item-description" rows="2">${escapeHtml(item.description || "")}</textarea>
        </label>
        <div class="field-grid three">
          <label>
            Precio
            <input type="number" class="item-price" step="0.01" value="${item.price ?? ""}" placeholder="0">
          </label>
          <label>
            Precio texto
            <input type="text" class="item-priceText" value="${escapeHtml(item.priceText || "")}" placeholder="$ 2.000">
            <small class="help-text">Si lo completas, reemplaza al precio numérico.</small>
          </label>
        </div>
        <label>
          Nota
          <input type="text" class="item-note" value="${escapeHtml(item.note || "")}">
        </label>
        <p class="item-net-preview"></p>
        <div class="upload-inline">
          <label>
            Imagen
            <input type="text" class="item-imageUrl" value="${escapeHtml(item.imageUrl || "")}" placeholder="https://...">
          </label>
          <div class="upload-actions">
            <button type="button" class="btn btn-light" data-action="upload-item-image">Subir imagen</button>
            <a href="#" target="_blank" class="link-preview item-preview">Ver</a>
          </div>
        </div>
        <label>
          Etiquetas (separadas por coma)
          <input type="text" class="item-badges" value="${escapeHtml((item.badges || []).join(", "))}">
        </label>
      `;
      container.appendChild(card);

      const previewLink = card.querySelector(".item-preview");
      const imageInput = card.querySelector(".item-imageUrl");
      const netPreviewEl = card.querySelector(".item-net-preview");
      setPreviewLink(previewLink, item.imageUrl);
      updateItemNetPreview(netPreviewEl, item.price);

      const fields = {
        ".item-name": (value) => {
          item.name = value;
        },
        ".item-description": (value) => {
          item.description = value;
        },
        ".item-price": (value) => {
          const parsed = value === "" ? null : Number(value);
          item.price = Number.isFinite(parsed) ? parsed : null;
          updateItemNetPreview(netPreviewEl, item.price);
        },
        ".item-priceText": (value) => {
          item.priceText = value;
        },
        ".item-note": (value) => {
          item.note = value;
        },
        ".item-imageUrl": (value) => {
          item.imageUrl = value;
        },
        ".item-badges": (value) => {
          item.badges = value
            .split(",")
            .map((token) => token.trim())
            .filter(Boolean);
        },
      };

      Object.entries(fields).forEach(([selector, updater]) => {
        const input = card.querySelector(selector);
        input.addEventListener("input", (event) => {
          updater(event.target.value);
          if (selector === ".item-imageUrl") {
            setPreviewLink(previewLink, event.target.value);
          }
          markDirty();
        });
      });

      const uploadButton = card.querySelector("[data-action='upload-item-image']");
      if (!canUpload) {
        uploadButton.disabled = true;
        uploadButton.title = "Subida deshabilitada. Configurá Cloudinary.";
      } else {
        uploadButton.addEventListener("click", () => {
          const sectionFolder = section.key ? `items/${section.key}` : `items/${sectionIndex}`;
          openUploader(sectionFolder, (url) => {
            item.imageUrl = url;
            imageInput.value = url;
            setPreviewLink(previewLink, url);
            markDirty();
          });
        });
      }

      card.querySelector("[data-action='remove-item']").addEventListener("click", () => {
        if (!confirm("¿Eliminar este ítem?")) return;
        section.items.splice(itemIndex, 1);
        renderSections();
        markDirty();
      });
    });

    if (!section.items || section.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No hay ítems en esta categoría.";
      container.appendChild(empty);
    }
  }

  function renderNotes() {
    notesContainer.innerHTML = "";
    (menu.notes || []).forEach((note, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "note-row";
      wrapper.dataset.noteIndex = index.toString();
      wrapper.innerHTML = `
        <textarea rows="2">${escapeHtml(note)}</textarea>
        <button type="button" class="btn btn-light" data-action="remove-note">Eliminar</button>
      `;
      notesContainer.appendChild(wrapper);

      const textarea = wrapper.querySelector("textarea");
      textarea.addEventListener("input", (event) => {
        menu.notes[index] = event.target.value;
        markDirty();
      });
      wrapper.querySelector("[data-action='remove-note']").addEventListener("click", () => {
        menu.notes.splice(index, 1);
        renderNotes();
        markDirty();
      });
    });

    if (!menu.notes || menu.notes.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Sin notas. Agregá una con el botón de arriba.";
      notesContainer.appendChild(empty);
    }
  }

  function createEmptySection() {
    const index = menu.sections.length + 1;
    return {
      key: `categoria-${Date.now()}`,
      title: `Categoría ${index}`,
      description: "",
      items: [],
    };
  }

  function createEmptyItem(section) {
    return {
      name: `Item ${section.items.length + 1}`,
      description: "",
      price: null,
      netPrice: null,
      priceText: "",
      note: "",
      imageUrl: "",
      badges: [],
    };
  }

  async function saveMenu() {
    setStatus("Guardando...", "info");
    try {
      const response = await fetch(`/menu-qr/admin/api/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menu),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo guardar.");
      }
      dirty = false;
      setStatus("Cambios guardados correctamente.", "success");
    } catch (error) {
      setStatus(error.message || "Error al guardar.", "error");
    }
  }

  async function reloadMenu() {
    if (dirty && !confirm("Perderás los cambios no guardados. ¿Continuar?")) {
      return;
    }
    setStatus("Recargando datos...", "info");
    try {
      const response = await fetch(`/menu-qr/admin/api/${slug}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo obtener el menú.");
      }
      menu = normalizeMenu(data);
      dirty = false;
      populateStaticInputs();
      renderSections();
      renderNotes();
      setStatus("Datos actualizados.", "success");
    } catch (error) {
      setStatus(error.message || "Error al recargar.", "error");
    }
  }

  function populateStaticInputs() {
    generalInputs.forEach((input) => {
      const field = input.dataset.field;
      if (field) {
        input.value = menu[field] || "";
      }
    });
    brandingInputs.forEach((input) => {
      const field = input.dataset.branding;
      if (field) {
        input.value = menu.branding[field] || "";
      }
    });
    contactInputs.forEach((input) => {
      const field = input.dataset.contact;
      if (field) {
        input.value = menu.branding.contact[field] || "";
      }
    });
    setPreviewLink(logoPreview, menu.branding.logoUrl);
    setPreviewLink(heroPreview, menu.branding.heroImage);
  }

  document.getElementById("add-section").addEventListener("click", () => {
    menu.sections.push(createEmptySection());
    renderSections();
    markDirty();
  });

  document.getElementById("add-note").addEventListener("click", () => {
    menu.notes.push("Nueva nota");
    renderNotes();
    markDirty();
  });

  document.getElementById("save-menu").addEventListener("click", saveMenu);
  document.getElementById("reload-menu").addEventListener("click", reloadMenu);

  bindGeneralInputs();
  bindBrandingInputs();
  bindContactInputs();
  initBrandingUploadButtons();
  renderSections();
  renderNotes();
})();
