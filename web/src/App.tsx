import React from 'react'
import '@shopify/polaris/build/esm/styles.css'
import enTranslations from '@shopify/polaris/locales/en.json'
import { AppProvider, Page, Card } from '@shopify/polaris'
import NewJobForm from './components/NewJobForm'

export default function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <Page title="Let's check some backgrounds, eh?">
        <Card>
          <NewJobForm></NewJobForm>
        </Card>
      </Page>
    </AppProvider>
  )
}
