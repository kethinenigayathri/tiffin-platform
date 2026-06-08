export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>🍛 Indian Kitchen</h4>
          <p>Authentic Indian food, freshly cooked daily in Dessau-Roßlau, Germany.</p>
          <p>Parcel · Subscription · Pickup</p>
        </div>
        <div>
          <h4>Visit Us</h4>
          <p>Dessau-Roßlau, 06844</p>
          <p>Germany</p>
          <p>Mon–Sun · 8:00 – 22:00</p>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="tel:+49 1514 2669417">+49 1514 2669417</a>
          <a href="mailto:kethinenigayathri2005@gmail.com">Mail</a>
          <a href="https://www.instagram.com/herlens.journal/" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} Indian Kitchen · Kleinunternehmer gem. §19 UStG
      </div>
    </footer>
  );
}
