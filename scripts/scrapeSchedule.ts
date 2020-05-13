import puppeteer from "puppeteer";
import { join, resolve} from 'path';
import { promisify} from 'util';
import * as fs from 'fs';
import {VideoScheduleRowContents, VideoScheduleStudent, IDisplayEntry } from '../src/types';

const writeFile = promisify(fs.writeFile);

interface SchedulEntry {
  time: string;
  name: string;
}

type DaySchedule = SchedulEntry[]

interface DaySchedules {
  tuesday: DaySchedule,
  wednesday: DaySchedule,
  thursday: DaySchedule,
  friday: DaySchedule
}

const parseDaySchedule = (dayOfWeek: 'tuesday' | 'wednesday' | 'thursday' | 'friday', scheduleByTime: VideoScheduleRowContents[] | null): DaySchedule => {
  const result: DaySchedule = [];

  if (!scheduleByTime) return result;

  for(let row of scheduleByTime) {
    if (!row[dayOfWeek]) continue;
    
    const name = row[dayOfWeek]?.name;

    if (!name) continue;

    result.push({name, time: row.time});
  }

  return result;
}

const breakTypes = ["break", "lunch"];

const toPlayableSchedule = (daySchedule: DaySchedule): IDisplayEntry[] => {
  const technicalDiffulty: IDisplayEntry = {
    pre_title: 'Come back soon',
    title: 'Technical difficulties'
  };

  const firstStartTime = daySchedule[0].time;

  const startScheduleEntry: IDisplayEntry = {
    pre_title: '',
    title: `Presentations begin at ${firstStartTime}`
  };


  const result: IDisplayEntry[] = [];

  result.push(technicalDiffulty);
  result.push(startScheduleEntry);


  let breaking: string | null = null;

  for(let entry of daySchedule) {
    if (breakTypes.includes(entry.name.toLowerCase())) {
      breaking = entry.name.toLowerCase();
      continue;
    }

    if (breaking) {
      result.push({
        pre_title: `${breaking}. Come back at ${entry.time}`,
        title: `Up Next: ${entry.name}`
      });
      breaking = null;
    } else {
      result.push({
        pre_title: '',
        title: `Up Next: ${entry.name}`
      });
    }

  }

  return result;
}

const scrapeSchedule = async (url: string, destinationFileName: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  console.log('scraping schedule from ', url);

  const evalResults: VideoScheduleRowContents[] | null = await page.evaluate(() => {
    const parseStudentColumn = (column: HTMLTableCellElement | undefined): VideoScheduleStudent | undefined => {
      if (!column) return undefined;

      const name = column.innerText;

      if (!name || name === '') return;


      return {
        name
      }
    };

    const parseContents = (rowElement: Element): VideoScheduleRowContents => {
      const columns = rowElement.querySelectorAll('td');
      const numColumns = columns.length;

      const tuesdayColumn = numColumns === 5 ? 1 : -1;
      const wednesdayColumn = numColumns === 5 ? 2 : -1;
      const thursdayColumn = numColumns === 5 ? 3 : -1;
      const fridayColumn = numColumns === 5 ? 4 : 1;

      return {
        time: columns[0].innerText,
        tuesday: parseStudentColumn(columns[tuesdayColumn]),
        wednesday: parseStudentColumn(columns[wednesdayColumn]),
        thursday: parseStudentColumn(columns[thursdayColumn]),
        friday: parseStudentColumn(columns[fridayColumn])
      }
    };

    const dailyScheduleTable = document.querySelector(
      "article table:last-of-type"
    );
    
    if (!dailyScheduleTable) return null;

    const rows = dailyScheduleTable.querySelectorAll('tbody tr:not(:first-child)');

    const rowContents: VideoScheduleRowContents[] = [];

    for(let i = 0; i < rows.length; i++) {
      rowContents.push(parseContents(rows[i]));
    }

    return rowContents;
  });


  console.log('got schedule: ', evalResults);


  ['tuesday', 'wednesday', 'thursday', 'friday'].forEach(async day => {
    const daySchedule = parseDaySchedule('tuesday', evalResults);

    const scheduleEntry = toPlayableSchedule(daySchedule);


    const outFileContents = `
import { IDisplayEntry } from "types";

export const schedule: IDisplayEntry[] = ${JSON.stringify(scheduleEntry , null, 2)}
    `

    const desinationFile = resolve(join(__dirname, `../src/schedules/${day}.ts`));

    await writeFile(desinationFile, outFileContents);
  })

  


};

scrapeSchedule("https://itp.nyu.edu/shows/thesis2020/", "schedule-2020.json");
