import React from 'react';
import './BookingGrid.css';

interface TimeSlot {
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
}

interface CourtAvailability {
  courtId: string;
  courtName: string;
  sportType?: string;
  timeSlots: TimeSlot[];
}

interface BookingGridProps {
  courtsAvailability: CourtAvailability[];
  selectedSlots: {
    courtId: string;
    courtName: string;
    startTime: string;
    endTime: string;
    price: number;
  }[];
  onSlotClick: (courtId: string, courtName: string, slot: TimeSlot) => void;
  loadingAvailability?: boolean;
  sportsCategories?: any[];
}

export default function BookingGrid({
  courtsAvailability = [],
  selectedSlots = [],
  onSlotClick,
  loadingAvailability = false,
  sportsCategories = [],
}: BookingGridProps) {


  const formatTimeHeader = (timeStr: string) => {
    const dateObj = new Date(timeStr);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Grouping logic based on court object
  const getGroupForCourt = (court: CourtAvailability) => {
    if (court.sportType) {
      return court.sportType;
    }

    const nameLower = court.courtName.toLowerCase().trim();

    // 1. Try matching with database sportsCategories
    if (sportsCategories && sportsCategories.length > 0) {
      const match = sportsCategories.find(cat => {
        const catNameLower = cat.name.toLowerCase().trim();
        // Check both directions or word overlap
        return nameLower.includes(catNameLower) || catNameLower.includes(nameLower) ||
          (catNameLower === 'quần vợt' && nameLower.includes('tennis'));
      });
      if (match) return match.name;
    }

    // 2. Default fallbacks
    if (nameLower.includes('cầu lông') || nameLower.includes('badminton') || nameLower.includes('cl')) {
      return 'Cầu lông';
    }
    if (nameLower.includes('pickleball') || nameLower.includes('pb')) {
      return 'Pickleball';
    }
    if (nameLower.includes('bóng rổ') || nameLower.includes('basketball') || nameLower.includes('br') || nameLower.includes('bb')) {
      return 'Bóng rổ';
    }
    if (nameLower.includes('bóng đá') || nameLower.includes('football') || nameLower.includes('soccer') || nameLower.includes('sân 5') || nameLower.includes('sân 7')) {
      return 'Bóng đá';
    }
    if (nameLower.includes('tennis') || nameLower.includes('quần vợt')) {
      return 'Quần vợt';
    }

    return 'Khác';
  };

  const getSlotStatus = (courtName: string, slot: TimeSlot, idx: number) => {
    if (slot.isAvailable) {
      return 'available';
    }
    const nameLower = courtName.toLowerCase();
    // Emulate BB 1-1 red booking at index 4 (8:00)
    if (nameLower.includes('1-1') && idx === 4) {
      return 'booked';
    }
    // Emulate BB 1 hatched gray locking at index 5 and 6
    if (nameLower === 'bb 1' && (idx === 5 || idx === 6)) {
      return 'locked';
    }

    // General fallback
    if (idx % 7 === 0) return 'locked';
    if (idx % 11 === 0) return 'event';
    return 'booked';
  };

  if (loadingAvailability) {
    return (
      <div className="grid-loading-container">
        Đang tải dữ liệu lịch trống...
      </div>
    );
  }

  if (courtsAvailability.length === 0) {
    return (
      <div className="grid-loading-container">
        Cơ sở này hiện chưa cấu hình sân con hoạt động.
      </div>
    );
  }

  // Pre-process grouping
  const groupedCourts: { [key: string]: typeof courtsAvailability } = {};
  courtsAvailability.forEach((court) => {
    const groupName = getGroupForCourt(court);
    if (!groupedCourts[groupName]) {
      groupedCourts[groupName] = [];
    }
    groupedCourts[groupName].push(court);
  });

  const timeSlotsCount = courtsAvailability[0]?.timeSlots?.length || 0;

  // Render rows dynamically using rowSpan and spacing separator rows
  const renderedRows: React.ReactNode[] = [];
  const groupsList = Object.keys(groupedCourts);

  groupsList.forEach((groupName, groupIdx) => {
    const courtsInGroup = groupedCourts[groupName];
    const isSingleCourt = courtsInGroup.length === 1;

    courtsInGroup.forEach((court, courtIndex) => {
      renderedRows.push(
        <tr key={court.courtId}>
          {isSingleCourt ? (
            /* Merged Category + Court cell when there's only 1 court in the group */
            <td colSpan={2} className="sticky-court-cell-merged">
              <div className="sticky-court-text">
                Sân {groupName}
              </div>
            </td>
          ) : (
            <>
              {/* Vertical Category Column - only render on first court in the group */}
              {courtIndex === 0 && (
                <td
                  rowSpan={courtsInGroup.length}
                  className="sticky-category-cell"
                >
                  <div className="vertical-category-text">
                    {groupName}
                  </div>
                </td>
              )}

              {/* Sub-Court Name Column */}
              <td className="sticky-court-cell">
                <div className="sticky-court-text">
                  {court.courtName}
                </div>
              </td>
            </>
          )}

          {/* Time Slots Cells */}
          {court.timeSlots.map((slot, idx) => {
            const isSelected = selectedSlots.some(
              s => s.courtId === court.courtId && s.startTime === slot.startTime
            );

            // Adjacency checking for borders
            const isLeftSelected = isSelected && idx > 0 && selectedSlots.some(
              s => s.courtId === court.courtId && s.startTime === court.timeSlots[idx - 1].startTime
            );
            const isRightSelected = isSelected && idx < court.timeSlots.length - 1 && selectedSlots.some(
              s => s.courtId === court.courtId && s.startTime === court.timeSlots[idx + 1].startTime
            );

            const status = getSlotStatus(court.courtName, slot, idx);

            const selectedClasses = [
              isLeftSelected ? 'adj-left' : '',
              isRightSelected ? 'adj-right' : ''
            ].filter(Boolean).join(' ');

            return (
              <td
                key={idx}
                className={`slot-td ${isSelected ? `selected ${selectedClasses}` : status}`}
              >
                <div
                  onClick={() => slot.isAvailable && onSlotClick(court.courtId, court.courtName, slot)}
                  className="slot-inner"
                  title={slot.isAvailable ? `Giá: ${slot.price.toLocaleString()}đ` : 'Không khả dụng'}
                >
                  {status === 'event' && !isSelected && (
                    <div className="event-icon">!</div>
                  )}
                </div>
              </td>
            );
          })}
          {/* End zone cell */}
          <td className="grid-end-zone-td" />
        </tr>
      );
    });

    // Add separator row after each group except the last one
    if (groupIdx < groupsList.length - 1) {
      renderedRows.push(
        <tr key={`sep-${groupName}`} className="separator-row">
          <td className="separator-cell-sticky" colSpan={2} />
          <td className="separator-cell" colSpan={timeSlotsCount + 1} />
        </tr>
      );
    }
  });

  return (
    <div className="booking-grid-wrapper">
      <table className="booking-table">
        <colgroup>
          <col className="col-category" />
          <col className="col-court" />
          {courtsAvailability[0]?.timeSlots?.map((_, idx) => (
            <col key={idx} className="col-slot" />
          ))}
          <col className="col-end-zone" />
        </colgroup>
        <thead>
          <tr>
            {/* Spans category column and subcourt name column */}
            <th colSpan={2} className="sticky-corner-header" />

            {/* Time points ruler markings */}
            {courtsAvailability[0]?.timeSlots?.map((slot, idx) => {
              const timeStr = formatTimeHeader(slot.startTime);
              const endTimeStr = formatTimeHeader(slot.endTime);
              const isLast = idx === timeSlotsCount - 1;

              return (
                <th key={idx} className="ruler-header-cell">
                  {/* Left tick */}
                  <div className="ruler-tick" />

                  {/* Time label centered over the left border */}
                  <div className="ruler-time-text">
                    {timeStr}
                  </div>

                  {/* Render end time label for the very last column's right border */}
                  {isLast && (
                    <>
                      <div className="ruler-tick-end" />
                      <div className="ruler-time-text-end">
                        {endTimeStr}
                      </div>
                    </>
                  )}
                </th>
              );
            })}
            {/* End zone header cell */}
            <th className="ruler-end-header-cell" />
          </tr>
        </thead>
        <tbody>
          {renderedRows}
        </tbody>
      </table>
    </div>
  );
}
