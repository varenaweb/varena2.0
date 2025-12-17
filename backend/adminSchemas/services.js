const {
  textField,
  textareaField,
  createListFields,
  navItemFields,
  footerLinkFields,
  whatsappFields,
  metaFields,
} = require("./common");

const servicesFields = [
  ...metaFields(),
  ...navItemFields(),

  textField("hero.kicker", "Hero – kicker"),
  textField("hero.title", "Hero – title"),
  textareaField("hero.description", "Hero – description")
];

for (let i = 0; i < 3; i += 1) {
  servicesFields.push(
    textField(`cards[${i}].title`, `Hero card ${i + 1} title`),
    textareaField(`cards[${i}].text`, `Hero card ${i + 1} description`),
    ...createListFields(`cards[${i}].list`, `Hero card ${i + 1} list item`, 5, "textarea")
  );
}

servicesFields.push(
  textField("common.kicker", "Common section – kicker"),
  textField("common.title", "Common section – title"),
  textareaField("common.description", "Common section – description")
);

for (let i = 0; i < 3; i += 1) {
  servicesFields.push(
    textField(`common.cards[${i}].title`, `Common card ${i + 1} title`),
    ...createListFields(
      `common.cards[${i}].list`,
      `Common card ${i + 1} list item`,
      3,
      "textarea"
    )
  );
}

servicesFields.push(textField("footer.tagline", "Footer – tagline"));
servicesFields.push(...footerLinkFields());
servicesFields.push(...whatsappFields());

module.exports = servicesFields;
