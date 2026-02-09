const data = {
  en: [
    { value: 20, suffix: "+", label: "Years Experience" },
    { value: 300, suffix: "+", label: "K8s Clusters" },
    { value: 10, suffix: "", label: "Certifications" },
    { value: 3, suffix: "", label: "Cloud Providers" },
  ],
  pt: [
    { value: 20, suffix: "+", label: "Anos de Experiência" },
    { value: 300, suffix: "+", label: "Clusters K8s" },
    { value: 10, suffix: "", label: "Certificações" },
    { value: 3, suffix: "", label: "Provedores Cloud" },
  ],
};

export function getHighlights(lang) {
  return data[lang] || data.en;
}

export default data.en;
