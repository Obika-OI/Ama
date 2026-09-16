import React from 'react';
import { 
  ScheduleType, IntervalSchedule, SpecificTimesSchedule, WeeklySchedule, PRNSchedule 
} from '../types';
import { parseToMinutes } from '../utils/scheduleEngine';

interface FlexibleScheduleBuilderProps {
  scheduleType: ScheduleType;
  onChangeScheduleType: (type: ScheduleType) => void;
  intervalConfig: IntervalSchedule;
  onChangeIntervalConfig: (config: IntervalSchedule) => void;
  specificTimesConfig: SpecificTimesSchedule;
  onChangeSpecificTimesConfig: (config: SpecificTimesSchedule) => void;
  weeklyConfig: WeeklySchedule;
  onChangeWeeklyConfig: (config: WeeklySchedule) => void;
  prnConfig: PRNSchedule;
  onChangePRNConfig: (config: PRNSchedule) => void;
  dosage?: string;
  onChangeDosage?: (dosage: string) => void;
}

export const FlexibleScheduleBuilder: React.FC<FlexibleScheduleBuilderProps> = ({
  scheduleType,
  onChangeScheduleType,
  intervalConfig,
  onChangeIntervalConfig,
  specificTimesConfig,
  onChangeSpecificTimesConfig,
  weeklyConfig,
  onChangeWeeklyConfig,
  prnConfig,
  onChangePRNConfig,
  dosage = '',
  onChangeDosage
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
          Schedule Type
        </label>
        <select
          value={scheduleType}
          onChange={e => onChangeScheduleType(e.target.value as ScheduleType)}
          className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700"
        >
          <option value="specific_times">Specific Daily Times</option>
          <option value="interval">Repeating Intervals (e.g., Every X hours)</option>
          <option value="weekly">Weekly Recurring</option>
          <option value="prn">As Needed (PRN)</option>
        </select>
      </div>

      {scheduleType === 'interval' && (
        <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Interval (Hours)</label>
            <input
              type="number"
              min="1"
              max="48"
              step="0.5"
              value={intervalConfig.intervalHours}
              onChange={e => onChangeIntervalConfig({ ...intervalConfig, intervalHours: parseFloat(e.target.value) || 4 })}
              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Start Time</label>
            <input
              type="time"
              value={intervalConfig.anchorTime.replace(/ [AP]M/, '')}
              onChange={e => {
                const [h, m] = e.target.value.split(':');
                const hour = parseInt(h);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                onChangeIntervalConfig({ ...intervalConfig, anchorTime: `${(hour % 12 || 12).toString().padStart(2, '0')}:${m} ${ampm}` });
              }}
              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input 
                type="checkbox" 
                checked={intervalConfig.mode === 'waking_hours'}
                onChange={e => onChangeIntervalConfig({ ...intervalConfig, mode: e.target.checked ? 'waking_hours' : 'continuous_24h' })}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Restrict to Waking Hours</span>
            </label>
          </div>
          {intervalConfig.mode === 'waking_hours' && (
            <>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Waking Start</label>
                <input type="time" value={intervalConfig.wakingStart?.replace(/ [AP]M/, '') || '07:00'} onChange={e => {
                  const [h, m] = e.target.value.split(':');
                  const hour = parseInt(h);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  onChangeIntervalConfig({ ...intervalConfig, wakingStart: `${(hour % 12 || 12).toString().padStart(2, '0')}:${m} ${ampm}` });
                }} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Waking End</label>
                <input type="time" value={intervalConfig.wakingEnd?.replace(/ [AP]M/, '') || '21:00'} onChange={e => {
                  const [h, m] = e.target.value.split(':');
                  const hour = parseInt(h);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  onChangeIntervalConfig({ ...intervalConfig, wakingEnd: `${(hour % 12 || 12).toString().padStart(2, '0')}:${m} ${ampm}` });
                }} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none" />
              </div>
            </>
          )}
        </div>
      )}

      {scheduleType === 'specific_times' && (
        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Alert Times</label>
           <div className="flex flex-wrap gap-2 mb-2">
             {specificTimesConfig.times.map((t, i) => (
               <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-semibold flex items-center gap-2">
                 {t}
                 <button onClick={() => onChangeSpecificTimesConfig({ ...specificTimesConfig, times: specificTimesConfig.times.filter((_, idx) => idx !== i) })} className="text-gray-400 hover:text-primary cursor-pointer border-none bg-transparent">×</button>
               </span>
             ))}
           </div>
           <input type="time" className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none" onChange={e => {
             const val = e.target.value;
             if (!val) return;
             const [h, m] = val.split(':');
             const hour = parseInt(h);
             const ampm = hour >= 12 ? 'PM' : 'AM';
             const newTime = `${(hour % 12 || 12).toString().padStart(2, '0')}:${m} ${ampm}`;
             if (!specificTimesConfig.times.includes(newTime)) {
               onChangeSpecificTimesConfig({ ...specificTimesConfig, times: [...specificTimesConfig.times, newTime].sort((a,b) => parseToMinutes(a) - parseToMinutes(b)) });
             }
             e.target.value = ''; // reset
           }} />
           <p className="text-[10px] text-gray-400 mt-1">Select a time to add it to the list.</p>
        </div>
      )}

      {scheduleType === 'weekly' && (
        <div className="space-y-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Days of Week</label>
            <div className="flex gap-1 flex-wrap">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const days = weeklyConfig.days.includes(i) ? weeklyConfig.days.filter(day => day !== i) : [...weeklyConfig.days, i].sort();
                    onChangeWeeklyConfig({ ...weeklyConfig, days });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${weeklyConfig.days.includes(i) ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Alert Times</label>
             <div className="flex flex-wrap gap-2 mb-2">
               {weeklyConfig.times.map((t, i) => (
                 <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-semibold flex items-center gap-2">
                   {t}
                   <button onClick={() => onChangeWeeklyConfig({ ...weeklyConfig, times: weeklyConfig.times.filter((_, idx) => idx !== i) })} className="text-gray-400 hover:text-primary cursor-pointer border-none bg-transparent">×</button>
                 </span>
               ))}
             </div>
             <input type="time" className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none" onChange={e => {
               const val = e.target.value;
               if (!val) return;
               const [h, m] = val.split(':');
               const hour = parseInt(h);
               const ampm = hour >= 12 ? 'PM' : 'AM';
               const newTime = `${(hour % 12 || 12).toString().padStart(2, '0')}:${m} ${ampm}`;
               if (!weeklyConfig.times.includes(newTime)) {
                 onChangeWeeklyConfig({ ...weeklyConfig, times: [...weeklyConfig.times, newTime].sort((a,b) => parseToMinutes(a) - parseToMinutes(b)) });
               }
               e.target.value = '';
             }} />
          </div>
        </div>
      )}

      {scheduleType === 'prn' && (
        <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Min Interval (Hrs)</label>
            <input type="number" min="1" max="24" value={prnConfig.minIntervalHours} onChange={e => onChangePRNConfig({ ...prnConfig, minIntervalHours: parseInt(e.target.value) || 4 })} className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Max Doses / 24h</label>
            <input type="number" min="1" max="12" value={prnConfig.maxDosesPer24h} onChange={e => onChangePRNConfig({ ...prnConfig, maxDosesPer24h: parseInt(e.target.value) || 4 })} className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none" />
          </div>
        </div>
      )}

      {onChangeDosage && (
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Dosage / Amount</label>
          <input
            type="text"
            placeholder="e.g. 5ml, 2 drops, 1 serving"
            value={dosage}
            onChange={e => onChangeDosage(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700"
          />
        </div>
      )}
    </div>
  );
};
