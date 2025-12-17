const {
  textField,
  textareaField,
  createListFields,
  navItemFields,
  footerLinkFields,
  whatsappFields,
  metaFields,
} = require("./common");

const contactFields = [
  ...metaFields(),
  ...navItemFields(),

  textField("hero.kicker", "Hero – kicker"),
  textField("hero.title", "Hero – title"),
  textareaField("hero.description", "Hero – description"),

  textField("prompts.title", "Prompts – title"),
  ...createListFields("prompts.items", "Prompts item", 4, "textarea"),
  textareaField("hint", "Hint")
];

contactFields.push(
  textField("contactForm.labels.name", "Contact form – name label"),
  textField("contactForm.labels.email", "Contact form – email label"),
  textField("contactForm.labels.projectType", "Contact form – project label"),
  textField("contactForm.labels.projectContext", "Contact form – context label"),
  textField("contactForm.labels.message", "Contact form – message label"),
  textField("contactForm.labels.submit", "Contact form – submit label"),
  textField("contactForm.projectOptionsSelect", "Contact form – project select text"),
  textField("contactForm.projectOptions.landing", "Contact form – option landing"),
  textField("contactForm.projectOptions.web_full", "Contact form – option web_full"),
  textField("contactForm.projectOptions.ecommerce", "Contact form – option ecommerce"),
  textField("contactForm.projectOptions.other", "Contact form – option other"),
  textField("contactForm.placeholders.name", "Contact form – name placeholder"),
  textField("contactForm.placeholders.projectContext", "Contact form – context placeholder"),
  textField("contactForm.placeholders.message", "Contact form – message placeholder")
);

contactFields.push(textField("footer.tagline", "Footer – tagline"));
contactFields.push(...footerLinkFields());
contactFields.push(...whatsappFields());

module.exports = contactFields;
