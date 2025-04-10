import ContactHero from "../components/contact/ContactHero";
import ContactForm from "../components/contact/ContactForm";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Contact = () => {
  return (
    <div className="contact-page">
      <Header />
      <ContactHero />
      <ContactForm />
      <Footer />
    </div>
  );
};

export default Contact;
