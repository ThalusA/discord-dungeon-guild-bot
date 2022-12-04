import { google, script_v1, sheets_v4 } from 'googleapis'
import { Client } from 'discord.js'
import path from 'node:path'
import fs from 'node:fs/promises'
import { authenticate } from '@google-cloud/local-auth'
import type { BaseExternalAccountClient, Impersonated, JWT, OAuth2Client, UserRefreshClient, JWTInput } from 'google-auth-library'
import { constants } from 'fs'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const DEPLOYED = await fs.access('/credentials', constants.F_OK).then(() => true).catch(() => false)
const TOKEN_PATH = path.join(DEPLOYED ? '/credentials' : process.cwd(), 'token.json')
const CREDENTIALS_PATH = path.join(DEPLOYED ? '/credentials' : process.cwd(), 'credentials.json')

type JSONClient = JWT | UserRefreshClient | BaseExternalAccountClient | Impersonated

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
  sheets: sheets_v4.Sheets | undefined
  script: script_v1.Script | undefined

  async login (): Promise<{ sheets: sheets_v4.Sheets, script: script_v1.Script }> {
    if (this.sheets === undefined || this.script === undefined) {
      const oauth2client = await this.authorize()
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
    await (await this.login()).sheets.spreadsheets.batchUpdate({
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
    await (await this.login()).script.scripts.run({
      requestBody: { function: 'update' },
      scriptId: client.env.GOOGLE_SCRIPT_ID
    })
  }

  async gatherSpreadSheetValue (client: Client, range: string, majorDimension: string): Promise<any[][] | null | undefined> {
    const response = await (await this.login()).sheets.spreadsheets.values.get({
      spreadsheetId: client.env.GOOGLE_SPREADSHEET_ID,
      range,
      majorDimension,
      valueRenderOption: 'UNFORMATTED_VALUE'
    })
    return response.data.values
  }

  async updateSpreadSheetValue (client: Client, range: string, majorDimension: string, values: string[][], clearRange: boolean): Promise<void> {
    const { sheets } = await this.login()
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
