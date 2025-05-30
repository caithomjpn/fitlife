import { differenceInDays, addDays } from 'date-fns';

export function getWellnessPhase(cycleStart: string, cycleLength: number): 'recovery' | 'activation' | 'peak' | 'taper' {
  const today = new Date();
  const start = new Date(cycleStart);
  const diff = (today.getTime() - start.getTime()) / (1000 * 3600 * 24);
  const dayInCycle = Math.floor(diff % cycleLength);

  if (dayInCycle < 5) return 'recovery';        // 生理期（回復）
  if (dayInCycle < 13) return 'activation';     // 卵胞期（やる気↑）
  if (dayInCycle < 16) return 'peak';           // 排卵期（ピーク）
  return 'taper';                               // 黄体期（調整・安静）
}


export function getMarkedDatesFromEndDate(
  cycleEndDateStr: string,
  cycleLength = 28,
  periodLength = 5,
  monthsToPredict = 4
): Record<string, any> {
  const marked: Record<string, any> = {};
  const endDate = new Date(cycleEndDateStr);

  for (let i = 1; i <= monthsToPredict; i++) {
    const nextStart = addDays(endDate, i * cycleLength);
    const ovulationDay = addDays(nextStart, -14);

    // 🔴 Period days
    for (let d = 0; d < periodLength; d++) {
      const date = addDays(nextStart, d);
      const dateStr = date.toISOString().split('T')[0];
      marked[dateStr] = {
        customStyles: {
          container: { backgroundColor: '#fdecea', borderRadius: 6 },
          text: { color: '#c2185b' },
        },
      };
    }

    // 🔵 Ovulation day
    const ovuStr = ovulationDay.toISOString().split('T')[0];
    marked[ovuStr] = {
      customStyles: {
        container: { borderColor: '#0277bd', borderWidth: 2, borderRadius: 6 },
        text: { color: '#0277bd' },
      },
    };
  }

  const actualEndStr = endDate.toISOString().split('T')[0];
  marked[actualEndStr] = {
    customStyles: {
      container: { backgroundColor: '#fff176', borderRadius: 6 },
      text: { color: '#795548' },
    },
  };

  return marked;
}

