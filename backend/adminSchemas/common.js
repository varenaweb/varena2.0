function textField(path, label) {
  return { path, label, type: "text" };
}

function textareaField(path, label) {
  return { path, label, type: "textarea" };
}

function createListFields(basePath, labelBase, count, type = "text") {
  const fields = [];
  for (let i = 0; i < count; i++) {
    fields.push({
      path: `${basePath}[${i}]`,
      label: `${labelBase} #${i + 1}`,
      type,
    });
  }
  return fields;
}

function navItemFields(count = 5, labelPrefix = "Navigation label") {
  return Array.from({ length: count }, (_, idx) =>
    textField(`nav.items[${idx}].label`, `${labelPrefix} #${idx + 1}`)
  );
}

function footerLinkFields(count = 4) {
  return Array.from({ length: count }, (_, idx) =>
    textField(`footer.links[${idx}].label`, `Footer link #${idx + 1}`)
  );
}

function whatsappFields() {
  return [
    textField("whatsapp.message", "WhatsApp – message"),
    textField("whatsapp.label", "WhatsApp – label"),
  ];
}

function metaFields() {
  return [
    textField("meta.title", "Meta – page title"),
    textareaField("meta.description", "Meta – description"),
    textField("meta.langLabel", "Meta – language label"),
  ];
}

module.exports = {
  textField,
  textareaField,
  createListFields,
  navItemFields,
  footerLinkFields,
  whatsappFields,
  metaFields,
};
