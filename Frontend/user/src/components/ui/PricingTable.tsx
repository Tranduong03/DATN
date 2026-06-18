import React from 'react';

interface PriceRule {
  dayOfWeek: number | null;
  startHour: string;
  endHour: string;
  price: number;
  description?: string | null;
}

interface PricingTableProps {
  priceRules: PriceRule[];
  sportTypes?: string[];
  isDark?: boolean;
}

export default function PricingTable({ priceRules, sportTypes = [], isDark = false }: PricingTableProps) {
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
    const start = normalizeTime(rule.startHour);
    const end = normalizeTime(rule.endHour);
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
        timeSlot: `${g.startHour} - ${g.endHour}`,
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

  const sportName = sportTypes.length > 0 ? sportTypes.join(' & ') : 'Cơ sở';

  // Theme styles
  const containerStyle: React.CSSProperties = {
    width: '100%',
    margin: '16px 0',
    border: `1px solid ${isDark ? '#4b6b55' : '#10b981'}`,
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
    boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.03)'
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc',
    color: isDark ? '#34d399' : '#064e3b',
    fontWeight: 700,
    fontSize: '12px',
    padding: '10px 8px',
    borderBottom: `1.5px solid ${isDark ? '#4b6b55' : '#10b981'}`,
    borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    textAlign: 'center'
  };

  const cellStyle: React.CSSProperties = {
    padding: '12px 8px',
    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
    borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
    textAlign: 'center',
    verticalAlign: 'middle',
    color: isDark ? '#ffffff' : '#1e293b',
    fontSize: '13px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 700,
        color: isDark ? '#34d399' : '#064e3b',
        margin: '12px 0 4px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        BẢNG GIÁ SÂN
      </div>
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 500,
        color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b',
        marginBottom: '12px'
      }}>
        {sportName}
      </div>

      <div style={containerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headerStyle}>Thứ</th>
              <th style={headerStyle}>Khung giờ</th>
              <th style={headerStyle}>Cố định</th>
              <th style={headerStyle}>Vãng lai</th>
            </tr>
          </thead>
          <tbody>
            {rowsWithSpan.map((row, idx) => (
              <tr key={idx}>
                {row.isFirstOfGroup && (
                  <td
                    rowSpan={row.rowSpan}
                    style={{
                      ...cellStyle,
                      fontWeight: 600,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(248, 250, 252, 0.5)',
                      borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`
                    }}
                  >
                    {row.daysText}
                  </td>
                )}
                <td style={cellStyle}>{row.timeSlot}</td>
                <td style={{ ...cellStyle, fontWeight: 500 }}>
                  {row.fixedPrice !== null ? (
                    <>
                      {row.fixedPrice.toLocaleString('vi-VN')}<span style={{ textDecoration: 'underline', fontSize: '11px', marginLeft: '2px' }}>đ</span>
                    </>
                  ) : (
                    '-'
                  )}
                </td>
                <td style={{ ...cellStyle, fontWeight: 500 }}>
                  {row.casualPrice !== null ? (
                    <>
                      {row.casualPrice.toLocaleString('vi-VN')}<span style={{ textDecoration: 'underline', fontSize: '11px', marginLeft: '2px' }}>đ</span>
                    </>
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
