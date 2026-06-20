import './PricingTable.css';

interface PriceRule {
  dayOfWeek: number | null;
  startHour: string;
  endHour: string;
  price: number;
  description?: string | null;
}

const formatOperatingHour = (timeStr?: string) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const hour = parseInt(parts[0], 10);
  const min = parseInt(parts[1], 10);
  if (hour === 23 && min === 59) {
    return '24:00';
  }
  const minStr = min.toString().padStart(2, '0');
  return `${hour}:${minStr}`;
};

interface PricingTableProps {
  priceRules: PriceRule[];
  sportTypes?: string[];
  isDark?: boolean;
  operatingStartHour?: string;
  operatingEndHour?: string;
}

export default function PricingTable({
  priceRules,
  sportTypes = [],
  isDark = false,
  operatingStartHour,
  operatingEndHour,
}: PricingTableProps) {
  if (!priceRules || priceRules.length === 0) {
    return (
      <div style={{ padding: '24px 16px', textAlign: 'center', opacity: 0.7, fontSize: '13px', color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b' }}>
        Chưa cấu hình bảng giá sân.
      </div>
    );
  }

  // 1. Group price rules by Day Group, Time Slot, and Price Type
  const normalizeTime = (t: string) => {
    if (!t) return "";
    return t.substring(0, 5); // "05:00"
  };

  const groups: {
    [key: string]: {
      dayGroup: string;
      daysOrder: number;
      startHour: string;
      endHour: string;
      fixedPrice: number | null;
      casualPrice: number | null;
      defaultPrice: number | null;
    };
  } = {};

  priceRules.forEach((rule) => {
    let start = normalizeTime(rule.startHour);
    let end = normalizeTime(rule.endHour);

    if (start === '00:00' && (end === '23:59' || end === '24:00' || end === '23:59:59')) {
      if (operatingStartHour) {
        start = normalizeTime(operatingStartHour);
      }
      if (operatingEndHour) {
        end = normalizeTime(operatingEndHour);
      }
    }

    const day = rule.dayOfWeek;

    let dayGroupKey = "all";
    let dayGroupText = "Tất cả các ngày";
    let daysOrder = 3; // Order for sorting

    if (day !== null && day !== undefined) {
      if (day >= 1 && day <= 5) {
        dayGroupKey = "weekday";
        dayGroupText = "T2 - T6";
        daysOrder = 1;
      } else if (day === 6 || day === 0) {
        dayGroupKey = "weekend";
        dayGroupText = "T7 - CN";
        daysOrder = 2;
      } else {
        dayGroupKey = `day-${day}`;
        dayGroupText = day === 0 ? "CN" : `Thứ ${day + 1}`;
        daysOrder = day === 0 ? 2.5 : day + 0.1;
      }
    }

    const key = `${dayGroupKey}_${start}_${end}`;
    if (!groups[key]) {
      groups[key] = {
        dayGroup: dayGroupText,
        daysOrder: daysOrder,
        startHour: start,
        endHour: end,
        fixedPrice: null,
        casualPrice: null,
        defaultPrice: null
      };
    }

    const desc = (rule.description || "").toLowerCase();
    const isFixed = desc.includes("cố định") || desc.includes("co dinh") || desc.includes("cố");
    const isCasual = desc.includes("vãng lai") || desc.includes("vang lai") || desc.includes("lẻ") || desc.includes("le");

    if (isFixed) {
      groups[key].fixedPrice = rule.price;
    } else if (isCasual) {
      groups[key].casualPrice = rule.price;
    } else {
      groups[key].defaultPrice = rule.price;
    }
  });

  // Convert to array and sort
  const sortedRows = Object.values(groups)
    .map((g) => {
      let fixed = g.fixedPrice;
      let casual = g.casualPrice;

      if (fixed === null && casual === null && g.defaultPrice !== null) {
        // Fallback: if only a single price is set without matching description,
        // treat it as casual and copy to fixed as well.
        casual = g.defaultPrice;
        fixed = g.defaultPrice;
      }

      return {
        daysText: g.dayGroup,
        daysOrder: g.daysOrder,
        timeSlot: `${formatOperatingHour(g.startHour)} - ${formatOperatingHour(g.endHour)}`,
        fixedPrice: fixed,
        casualPrice: casual
      };
    })
    .sort((a, b) => {
      if (a.daysOrder !== b.daysOrder) {
        return a.daysOrder - b.daysOrder;
      }
      return a.timeSlot.localeCompare(b.timeSlot);
    });

  // Calculate row spans
  const rowsWithSpan = sortedRows.map((row, index) => {
    const isFirstOfGroup = index === 0 || sortedRows[index - 1].daysText !== row.daysText;
    let rowSpan = 1;
    if (isFirstOfGroup) {
      let nextIdx = index + 1;
      while (nextIdx < sortedRows.length && sortedRows[nextIdx].daysText === row.daysText) {
        rowSpan++;
        nextIdx++;
      }
    }
    return {
      ...row,
      isFirstOfGroup,
      rowSpan
    };
  });
  const sportName = sportTypes.length > 0 ? sportTypes.join(' & ') : 'Mặc định';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div className="pricing-table-title">
        Bảng giá sân
      </div>

      <div className="pricing-table-container">
        <table className="pricing-table-root">
          <thead>
            <tr>
              <th colSpan={4} className="pricing-table-main-header">
                {sportName}
              </th>
            </tr>
            <tr>
              <th className="pricing-table-header">Thứ</th>
              <th className="pricing-table-header">Khung giờ</th>
              <th className="pricing-table-header">Cố định</th>
              <th className="pricing-table-header" style={{ borderRight: 'none' }}>Vãng lai</th>
            </tr>
          </thead>
          <tbody>
            {rowsWithSpan.map((row, idx) => (
              <tr key={idx}>
                {row.isFirstOfGroup && (
                  <td
                    rowSpan={row.rowSpan}
                    className="pricing-table-cell pricing-table-cell-bold"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    {row.daysText}
                  </td>
                )}
                <td className="pricing-table-cell">{row.timeSlot}</td>
                <td className="pricing-table-cell pricing-table-cell-bold">
                  {row.fixedPrice !== null ? (
                    `${row.fixedPrice.toLocaleString('vi-VN')} đ`
                  ) : (
                    '-'
                  )}
                </td>
                <td className="pricing-table-cell pricing-table-cell-bold pricing-table-cell-last">
                  {row.casualPrice !== null ? (
                    `${row.casualPrice.toLocaleString('vi-VN')} đ`
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
