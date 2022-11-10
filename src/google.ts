import fs from 'node:fs/promises'
import { authenticate } from '@google-cloud/local-auth'
import type { BaseExternalAccountClient, Impersonated, JWT, OAuth2Client, UserRefreshClient } from 'google-auth-library'
import { google, script_v1, sheets_v4 } from 'googleapis'
import { JWTInput } from 'google-auth-library/build/src/auth/credentials'

type JSONClient = JWT | UserRefreshClient | BaseExternalAccountClient | Impersonated

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const TOKEN_PATH = 'token.json'
const CREDENTIALS_PATH = 'credentials.json'

class Auth {
  async loadSavedCredentialsIfExist (): Promise<JSONClient | null> {
    try {
      const content = (await fs.readFile(TOKEN_PATH)).toString()
      const credentials = JSON.parse(content)
      return google.auth.fromJSON(credentials)
    } catch (err) {
      return null
    }
  }

  async saveCredentials (client: OAuth2Client): Promise<void> {
    const content = (await fs.readFile(CREDENTIALS_PATH)).toString()
    const keys: { installed?: JWTInput, web?: JWTInput } = JSON.parse(content)
    const key = keys.installed ?? keys.web
    if (key === undefined) {
      throw new Error("Couldn't find key in credentials file.")
    }
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token
    })
    await fs.writeFile(TOKEN_PATH, payload)
  }

  async authorize (): Promise<JSONClient | OAuth2Client> {
    const savedClient = await this.loadSavedCredentialsIfExist()
    if (savedClient !== null) {
      return savedClient
    }
    const client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH
    })
    await this.saveCredentials(client)
    return client
  }
}

export default class Google extends Auth {
  logged_in: boolean
  sheets: sheets_v4.Sheets | undefined
  script: script_v1.Script | undefined

  constructor () {
    super()
    this.logged_in = false
  }

  async login (): Promise<{ sheets: sheets_v4.Sheets, script: script_v1.Script }> {
    if (!this.logged_in) {
      const auth = await this.authorize()
      this.sheets = google.sheets({ version: 'v4', auth })
      this.script = google.script({ version: 'v1', auth })
      this.logged_in = true
    }
    return { sheets: this.sheets as sheets_v4.Sheets, script: this.script as script_v1.Script }
  }

  async shiftSpreadsheetValues (sheetId: number, [startRowIndex, endRowIndex]: [number, number], [startColumnIndex, endColumnIndex]: [number, number]): Promise<void> {
    await (await this.login()).sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID as string,
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

  async callAppsScript (): Promise<void> {
    await (await this.login()).script.scripts.run({
      requestBody: { function: 'update' },
      scriptId: process.env.GOOGLE_SCRIPT_ID as string
    })
  }

  async gatherSpreadSheetValue (range: string, majorDimension: string): Promise<any[][] | null | undefined> {
    const response = await (await this.login()).sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID as string,
      range,
      majorDimension,
      valueRenderOption: 'UNFORMATTED_VALUE'
    })
    return response.data.values
  }

  async updateSpreadSheetValue (range: string, majorDimension: string, values: string[][], clearRange: boolean): Promise<void> {
    const { sheets } = await this.login()
    if (clearRange) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID as string,
        range
      })
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID as string,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        majorDimension,
        values
      }
    })
  }
}
