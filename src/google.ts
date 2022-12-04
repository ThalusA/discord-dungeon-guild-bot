import { google, script_v1, sheets_v4 } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { Client } from 'discord.js'
import * as http from 'http'
import * as url from 'url'

export default class Google {
  sheets: sheets_v4.Sheets | undefined
  script: script_v1.Script | undefined

  async authorize (client: Client): Promise<OAuth2Client> {
    return await new Promise((resolve, reject) => {
      const oauth2client = new google.auth.OAuth2(
        client.env.GOOGLE_CLIENT_ID,
        client.env.GOOGLE_SECRET_CLIENT_ID,
        client.env.GOOGLE_REDIRECT_URI
      )

      const authorizeUrl = oauth2client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/spreadsheets'
      })

      const server = http
        .createServer((request, response) => {
          if ((request.url?.includes('/oauth2callback')) === true) {
            const queryString = new url.URL(request.url, client.env.GOOGLE_REDIRECT_URI).searchParams
            const code = queryString.get('code')
            response.end('Authentication successful! Please return to the console.')
            if (code !== null) {
              oauth2client.getToken(code).then(({ tokens }) => {
                oauth2client.setCredentials(tokens)
                server.close()
                resolve(oauth2client)
              }).catch((error) => reject(error))
            }
          }
        })
        .listen(3000, () => {
          console.info(`Go at this URL to authenticate: ${authorizeUrl}`)
        })
    })
  }

  async login (client: Client): Promise<{ sheets: sheets_v4.Sheets, script: script_v1.Script }> {
    if (this.sheets === undefined || this.script === undefined) {
      const oauth2client = await this.authorize(client)
      this.sheets = google.sheets({
        version: 'v4',
        auth: oauth2client
      })
      this.script = google.script({
        version: 'v1',
        auth: oauth2client
      })
    }
    return {
      sheets: this.sheets,
      script: this.script
    }
  }

  async shiftSpreadsheetValues (client: Client, sheetId: number, [startRowIndex, endRowIndex]: [number, number], [startColumnIndex, endColumnIndex]: [number, number]): Promise<void> {
    await (await this.login(client)).sheets.spreadsheets.batchUpdate({
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
    await (await this.login(client)).script.scripts.run({
      requestBody: { function: 'update' },
      scriptId: client.env.GOOGLE_SCRIPT_ID
    })
  }

  async gatherSpreadSheetValue (client: Client, range: string, majorDimension: string): Promise<any[][] | null | undefined> {
    const response = await (await this.login(client)).sheets.spreadsheets.values.get({
      spreadsheetId: client.env.GOOGLE_SPREADSHEET_ID,
      range,
      majorDimension,
      valueRenderOption: 'UNFORMATTED_VALUE'
    })
    return response.data.values
  }

  async updateSpreadSheetValue (client: Client, range: string, majorDimension: string, values: string[][], clearRange: boolean): Promise<void> {
    const { sheets } = await this.login(client)
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
