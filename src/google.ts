import { google, script_v1, sheets_v4 } from 'googleapis'
import { Client } from 'discord.js'

export default class Google {
  sheets: sheets_v4.Sheets | undefined
  script: script_v1.Script | undefined

  login (client: Client): { sheets: sheets_v4.Sheets, script: script_v1.Script } {
    if (this.sheets === undefined || this.script === undefined) {
      this.sheets = google.sheets({
        version: 'v4',
        auth: client.env.GOOGLE_API_KEY
      })
      this.script = google.script({
        version: 'v1',
        auth: client.env.GOOGLE_API_KEY
      })
    }
    return {
      sheets: this.sheets,
      script: this.script
    }
  }

  async shiftSpreadsheetValues (client: Client, sheetId: number, [startRowIndex, endRowIndex]: [number, number], [startColumnIndex, endColumnIndex]: [number, number]): Promise<void> {
    await this.login(client).sheets.spreadsheets.batchUpdate({
      spreadsheetId: client.env.GOOGLE_SPREADSHEET_ID,
      requestBody: {
        requests: [{
          insertRange: {
            range: {
              sheetId,
              startRowIndex,
              endRowIndex,
              startColumnIndex,
              endColumnIndex
            },
            shiftDimension: 'ROWS'
          }
        }]
      }
    })
  }

  async callAppsScript (client: Client): Promise<void> {
    await this.login(client).script.scripts.run({
      requestBody: { function: 'update' },
      scriptId: client.env.GOOGLE_SCRIPT_ID
    })
  }

  async gatherSpreadSheetValue (client: Client, range: string, majorDimension: string): Promise<any[][] | null | undefined> {
    const response = await this.login(client).sheets.spreadsheets.values.get({
      spreadsheetId: client.env.GOOGLE_SPREADSHEET_ID,
      range,
      majorDimension,
      valueRenderOption: 'UNFORMATTED_VALUE'
    })
    return response.data.values
  }

  async updateSpreadSheetValue (client: Client, range: string, majorDimension: string, values: string[][], clearRange: boolean): Promise<void> {
    const { sheets } = this.login(client)
    if (clearRange) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: client.env.GOOGLE_SPREADSHEET_ID,
        range
      })
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId: client.env.GOOGLE_SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        majorDimension,
        values
      }
    })
  }
}
