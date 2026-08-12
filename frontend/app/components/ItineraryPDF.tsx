"use client";
import { useState } from "react";

export default function DownloadPDF({ itinerary }: { itinerary: any }) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const pw = 210;
      const ph = 297;
      let y = 0;

      const newPage = () => { pdf.addPage(); y = 0; };
      const check = (need: number) => { if (y + need > ph - 10) newPage(); };

      const heading = (text: string, size = 20, color = [255, 107, 53] as number[]) => {
        check(size / 2 + 6);
        pdf.setFontSize(size);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont("helvetica", "bold");
        pdf.text(text, 15, y + size / 2 + 2);
        y += size / 2 + 8;
      };

      const body = (text: string, size = 10, color = [60, 60, 60] as number[], indent = 15) => {
        check(size + 4);
        pdf.setFontSize(size);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont("helvetica", "normal");
        const lines = pdf.splitTextToSize(text, pw - indent - 15);
        lines.forEach((line: string) => {
          check(size + 2);
          pdf.text(line, indent, y + size / 2);
          y += size / 2 + 3;
        });
      };

      const badge = (text: string, x: number, bY: number, bg = [255, 107, 53] as number[], fg = [255, 255, 255] as number[]) => {
        pdf.setFillColor(bg[0], bg[1], bg[2]);
        pdf.roundedRect(x, bY - 4, text.length * 2.2 + 6, 8, 2, 2, "F");
        pdf.setFontSize(8);
        pdf.setTextColor(fg[0], fg[1], fg[2]);
        pdf.setFont("helvetica", "bold");
        pdf.text(text, x + 3, bY + 1);
      };

      const divider = (color = [240, 240, 240] as number[]) => {
        check(6);
        pdf.setDrawColor(color[0], color[1], color[2]);
        pdf.line(15, y + 2, pw - 15, y + 2);
        y += 6;
      };

      const card = (h: number, bg = [255, 248, 245] as number[], border = [255, 107, 53] as number[]) => {
        check(h + 6);
        pdf.setFillColor(bg[0], bg[1], bg[2]);
        pdf.roundedRect(15, y, pw - 30, h, 3, 3, "F");
        pdf.setFillColor(border[0], border[1], border[2]);
        pdf.rect(15, y, 3, h, "F");
        y += 5;
      };

      // ══════════════════════════════════════
      // COVER PAGE
      // ══════════════════════════════════════
      pdf.setFillColor(255, 107, 53);
      pdf.rect(0, 0, pw, 70, "F");

      // Logo area
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "normal");
      pdf.text("BHARATXPLORERS", 15, 12);

      pdf.setFontSize(8);
      pdf.text("Discover India Beyond the Obvious", 15, 19);

      // Big destination name
      pdf.setFontSize(36);
      pdf.setFont("helvetica", "bold");
      pdf.text(itinerary.destination?.toUpperCase() || "YOUR TRIP", 15, 50);

      pdf.setFontSize(13);
      pdf.setFont("helvetica", "italic");
      pdf.text(`"${(itinerary.tagline || "").replace(/[^\x00-\x7F]/g, "")}"`, 15, 62);

      y = 82;

      // Vibe + Weather + Duration row
      const infoBoxes = [
        { label: "VIBE", val: itinerary.vibe || "Adventure" },
        { label: "WEATHER", val: (itinerary.weather || "").replace(/[^\x00-\x7F]/g, "") },
        { label: "DURATION", val: `${itinerary.days?.length || 0} Days` },
        { label: "BEST FOR", val: (itinerary.bestFor?.[0] || "All") },
      ];
      infoBoxes.forEach((box, i) => {
        const x = 15 + i * 47;
        pdf.setFillColor(255, 245, 240);
        pdf.roundedRect(x, y, 44, 22, 3, 3, "F");
        pdf.setFontSize(7);
        pdf.setTextColor(255, 107, 53);
        pdf.setFont("helvetica", "bold");
        pdf.text(box.label, x + 3, y + 8);
        pdf.setFontSize(9);
        pdf.setTextColor(30, 30, 30);
        pdf.setFont("helvetica", "normal");
        pdf.text(box.val.slice(0, 18), x + 3, y + 17);
      });
      y += 32;

      divider();

      // Budget breakdown
      if (itinerary.budget_breakdown) {
        heading("Budget Breakdown", 14, [30, 30, 30]);
        const entries = Object.entries(itinerary.budget_breakdown);
        const total = entries.reduce((a: any, [, v]: any) => a + Number(v), 0);
        const colors: Record<string, number[]> = {
          transport: [255, 107, 53],
          accommodation: [108, 99, 255],
          food: [247, 201, 72],
          activities: [0, 180, 220],
          shopping: [0, 200, 100],
        };
        const colW = (pw - 30) / entries.length;
        entries.forEach(([key, val]: any, i) => {
          const x = 15 + i * colW;
          const c = colors[key] || [150, 150, 150];
          pdf.setFillColor(c[0], c[1], c[2]);
          pdf.roundedRect(x, y, colW - 2, 24, 2, 2, "F");
          pdf.setFontSize(7);
          pdf.setTextColor(255, 255, 255);
          pdf.setFont("helvetica", "bold");
          pdf.text(key.toUpperCase().slice(0, 7), x + 3, y + 9);
          pdf.setFontSize(11);
          pdf.text(`Rs.${Number(val).toLocaleString()}`, x + 3, y + 19);
        });
        y += 32;
        pdf.setFontSize(12);
        pdf.setTextColor(255, 107, 53);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Total: Rs.${total.toLocaleString()}`, pw - 60, y);
        y += 12;
      }

      divider();

      // Packing list on cover
      if (itinerary.packing?.length > 0) {
        heading("Packing List", 13, [30, 30, 30]);
        const cols = 3;
        itinerary.packing.forEach((item: string, i: number) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          if (col === 0) check(8);
          const x = 15 + col * 62;
          pdf.setFontSize(9);
          pdf.setTextColor(60, 60, 60);
          pdf.setFont("helvetica", "normal");
          pdf.text(`+ ${item.replace(/[^\x00-\x7F]/g, "").slice(0, 22)}`, x, y + row * 7);
          if (col === cols - 1 || i === itinerary.packing.length - 1) {
            if (col === cols - 1) y += 7;
          }
        });
        y += 10;
      }

      // ══════════════════════════════════════
      // DAY PAGES
      // ══════════════════════════════════════
      itinerary.days?.forEach((day: any) => {
        newPage();

        // Day header bar
        pdf.setFillColor(20, 20, 30);
        pdf.rect(0, 0, pw, 28, "F");
        pdf.setFillColor(255, 107, 53);
        pdf.rect(0, 0, 5, 28, "F");

        pdf.setFontSize(9);
        pdf.setTextColor(255, 107, 53);
        pdf.setFont("helvetica", "bold");
        pdf.text(`DAY ${day.day}`, 12, 10);

        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255);
        pdf.text((day.title || "").replace(/[^\x00-\x7F]/g, ""), 12, 22);

        // Mood badge
        const mood = (day.mood || "Exciting").replace(/[^\x00-\x7F]/g, "");
        badge(mood, pw - mood.length * 2.2 - 20, 14, [255, 107, 53]);

        y = 36;

        // Story
        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        pdf.setFont("helvetica", "italic");
        const storyClean = (day.story || "").replace(/[^\x00-\x7F]/g, "");
        const storyLines = pdf.splitTextToSize(storyClean, pw - 30);
        storyLines.forEach((line: string) => {
          check(7);
          pdf.text(line, 15, y);
          y += 6;
        });
        y += 4;

        divider([230, 230, 230]);

        // Timeline
        heading("Today's Plan", 12, [30, 30, 30]);

        const slots = [
          { label: "MORNING", data: day.morning, color: [255, 180, 50] },
          { label: "AFTERNOON", data: day.afternoon, color: [255, 107, 53] },
          { label: "EVENING", data: day.evening, color: [108, 99, 255] },
        ];

        slots.forEach(({ label, data, color }) => {
          if (!data) return;
          check(28);
          pdf.setFillColor(248, 248, 255);
          pdf.roundedRect(15, y, pw - 30, 24, 2, 2, "F");
          pdf.setFillColor(color[0], color[1], color[2]);
          pdf.rect(15, y, 4, 24, "F");

          pdf.setFontSize(7);
          pdf.setTextColor(color[0], color[1], color[2]);
          pdf.setFont("helvetica", "bold");
          pdf.text(label, 22, y + 8);

          pdf.setFontSize(11);
          pdf.setTextColor(20, 20, 20);
          pdf.text((data.activity || "").replace(/[^\x00-\x7F]/g, ""), 22, y + 16);

          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.setFont("helvetica", "normal");
          const desc = (data.description || "").replace(/[^\x00-\x7F]/g, "");
          pdf.text(desc.slice(0, 60), 22, y + 21);

          pdf.setFontSize(10);
          pdf.setTextColor(255, 107, 53);
          pdf.setFont("helvetica", "bold");
          pdf.text(`Rs.${data.cost || 0}`, pw - 30, y + 16);

          y += 28;
        });

        y += 4;
        divider([230, 230, 230]);

        // Food
        if (day.food) {
          heading("Must Eat Today", 12, [30, 30, 30]);
          check(24);
          pdf.setFillColor(255, 250, 230);
          pdf.roundedRect(15, y, pw - 30, 22, 2, 2, "F");
          pdf.setFillColor(247, 201, 72);
          pdf.rect(15, y, 4, 22, "F");

          pdf.setFontSize(11);
          pdf.setTextColor(20, 20, 20);
          pdf.setFont("helvetica", "bold");
          pdf.text((day.food.name || "").replace(/[^\x00-\x7F]/g, ""), 22, y + 10);

          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.setFont("helvetica", "normal");
          pdf.text((day.food.description || "").replace(/[^\x00-\x7F]/g, "").slice(0, 70), 22, y + 17);

          pdf.setFontSize(10);
          pdf.setTextColor(247, 150, 0);
          pdf.setFont("helvetica", "bold");
          pdf.text(`~Rs.${day.food.cost || 0}`, pw - 30, y + 10);
          y += 28;
        }

        divider([230, 230, 230]);

        // Hotels
        if (day.hotels?.length > 0) {
          heading("Where to Stay", 12, [30, 30, 30]);
          day.hotels.slice(0, 3).forEach((hotel: any) => {
            check(20);
            pdf.setFillColor(240, 240, 255);
            pdf.roundedRect(15, y, pw - 30, 17, 2, 2, "F");

            pdf.setFontSize(10);
            pdf.setTextColor(20, 20, 20);
            pdf.setFont("helvetica", "bold");
            pdf.text((hotel.name || "").replace(/[^\x00-\x7F]/g, "").slice(0, 35), 20, y + 8);

            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.setFont("helvetica", "normal");
            pdf.text(`${hotel.type || ""} | Rating: ${hotel.rating || ""} | Rs.${hotel.price || 0}/night`, 20, y + 14);

            pdf.setFontSize(9);
            pdf.setTextColor(108, 99, 255);
            pdf.setFont("helvetica", "bold");
            pdf.text(`Rs.${hotel.price || 0}`, pw - 35, y + 8);

            y += 21;
          });
          y += 3;
        }

        // Cafes & Restaurants side by side
        if (day.cafes?.length > 0 || day.restaurants?.length > 0) {
          divider([230, 230, 230]);
          heading("Cafes & Restaurants", 12, [30, 30, 30]);

          const half = (pw - 35) / 2;

          // Cafes left
          if (day.cafes?.length > 0) {
            pdf.setFontSize(9);
            pdf.setTextColor(255, 107, 53);
            pdf.setFont("helvetica", "bold");
            pdf.text("CAFES", 15, y + 6);
            y += 10;
            day.cafes.slice(0, 2).forEach((cafe: any) => {
              check(16);
              pdf.setFillColor(245, 255, 248);
              pdf.roundedRect(15, y, half, 14, 2, 2, "F");
              pdf.setFontSize(9);
              pdf.setTextColor(20, 20, 20);
              pdf.setFont("helvetica", "bold");
              pdf.text((cafe.name || "").replace(/[^\x00-\x7F]/g, "").slice(0, 20), 18, y + 7);
              pdf.setFontSize(7);
              pdf.setTextColor(100, 100, 100);
              pdf.setFont("helvetica", "normal");
              pdf.text(`Rs.${cafe.price || 0} | ${cafe.rating || ""}*`, 18, y + 12);
              y += 18;
            });
          }

          // Restaurants right
          if (day.restaurants?.length > 0) {
            const startY = y - (day.cafes?.slice(0, 2).length || 0) * 18 - 10;
            pdf.setFontSize(9);
            pdf.setTextColor(255, 107, 53);
            pdf.setFont("helvetica", "bold");
            pdf.text("RESTAURANTS", 15 + half + 5, startY + 6);
            day.restaurants.slice(0, 2).forEach((rest: any, i: number) => {
              const ry = startY + 10 + i * 18;
              pdf.setFillColor(255, 248, 240);
              pdf.roundedRect(15 + half + 5, ry, half, 14, 2, 2, "F");
              pdf.setFontSize(9);
              pdf.setTextColor(20, 20, 20);
              pdf.setFont("helvetica", "bold");
              pdf.text((rest.name || "").replace(/[^\x00-\x7F]/g, "").slice(0, 20), 18 + half + 5, ry + 7);
              pdf.setFontSize(7);
              pdf.setTextColor(100, 100, 100);
              pdf.setFont("helvetica", "normal");
              pdf.text(`${rest.cuisine || ""} | Rs.${rest.price || 0}`, 18 + half + 5, ry + 12);
            });
          }
        }

        // Shopping
        if (day.shopping?.length > 0) {
          divider([230, 230, 230]);
          heading("Shopping Spots", 12, [30, 30, 30]);
          day.shopping.slice(0, 2).forEach((shop: any) => {
            check(16);
            pdf.setFillColor(255, 245, 255);
            pdf.roundedRect(15, y, pw - 30, 14, 2, 2, "F");
            pdf.setFontSize(9);
            pdf.setTextColor(20, 20, 20);
            pdf.setFont("helvetica", "bold");
            pdf.text((shop.name || "").replace(/[^\x00-\x7F]/g, "").slice(0, 35), 20, y + 7);
            pdf.setFontSize(7);
            pdf.setTextColor(100, 100, 100);
            pdf.setFont("helvetica", "normal");
            pdf.text(`${(shop.items || "").slice(0, 40)} | ${shop.priceRange || ""}`, 20, y + 12);
            y += 18;
          });
        }
      });

      // ══════════════════════════════════════
      // TIPS PAGE
      // ══════════════════════════════════════
      newPage();

      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, 0, pw, 28, "F");
      pdf.setFillColor(255, 107, 53);
      pdf.rect(0, 0, 5, 28, "F");
      pdf.setFontSize(18);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.text("Hidden Tips & Essentials", 12, 20);

      y = 38;

      if (itinerary.hidden_tips?.length > 0) {
        heading("Secret Tips", 14, [255, 107, 53]);
        itinerary.hidden_tips.forEach((tip: string, i: number) => {
          check(22);
          pdf.setFillColor(255, 248, 245);
          pdf.roundedRect(15, y, pw - 30, 18, 2, 2, "F");
          pdf.setFillColor(255, 107, 53);
          pdf.circle(21, y + 9, 3, "F");
          pdf.setFontSize(9);
          pdf.setTextColor(30, 30, 30);
          pdf.setFont("helvetica", "normal");
          const tipClean = tip.replace(/[^\x00-\x7F]/g, "");
          const tipLines = pdf.splitTextToSize(tipClean, pw - 50);
          tipLines.forEach((line: string, li: number) => {
            pdf.text(line, 28, y + 8 + li * 6);
          });
          y += tipLines.length > 1 ? 24 : 22;
        });
      }

      y += 8;

      if (itinerary.bestFor?.length > 0) {
        heading("Best For", 14, [108, 99, 255]);
        itinerary.bestFor.forEach((item: string) => {
          check(12);
          badge(item.replace(/[^\x00-\x7F]/g, ""), 15, y + 6, [108, 99, 255]);
          y += 14;
        });
      }

      // Footer
      pdf.setFillColor(255, 107, 53);
      pdf.rect(0, ph - 16, pw, 16, "F");
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "normal");
      pdf.text("Generated by BharatXplorers - Discover India Beyond the Obvious", 15, ph - 6);
      pdf.text(`${itinerary.destination} Trip Guide`, pw - 55, ph - 6);

      pdf.save(`BharatXplorers-${itinerary.destination}-Itinerary.pdf`);

    } catch (e) {
      console.error("PDF error:", e);
      alert("PDF generation failed. Please try again!");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      style={{
        width: "100%", padding: "16px", borderRadius: "12px",
        background: loading ? "var(--bg-card)" : "linear-gradient(135deg, #ff6b35, #f7c948)",
        color: loading ? "var(--text-secondary)" : "white",
        border: "none", fontWeight: 700, fontSize: "15px",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center",
        justifyContent: "center", gap: "8px",
        marginBottom: "12px"
      }}>
      {loading ? "Generating PDF..." : "Download Itinerary as PDF"}
    </button>
  );
}