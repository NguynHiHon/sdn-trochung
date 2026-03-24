import React from "react";
import HeroSection from "../components/home/HeroSection";
import TourGridSection from "../components/home/TourGridSection";
import Testimonials from "../components/home/Testimonials";
import ContactForm from "../components/home/ContactForm";
import CoreValuesSection from "../components/home/CoreValuesSection";

export default function Home() {
  return (
    <div
      className="home-page"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#fcfaf6",
      }}
    >
      <div style={{ flex: "1 0 auto" }}>
        <HeroSection />
        <TourGridSection />
        <CoreValuesSection />
        <Testimonials />
        <ContactForm />
      </div>
    </div>
  );
}
