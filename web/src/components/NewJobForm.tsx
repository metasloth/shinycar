import { Form, FormLayout, TextField, Button } from '@shopify/polaris'
import React, { useState, useCallback } from 'react'

export default function NewJobForm() {
  const [nameList, setNameList] = useState('')
  const [formEnabled, setFormEnabled] = useState(true)
  const [formErrorMessage, setFormErrorMessage] = useState('')

  // Main form submission
  const handleSubmit = useCallback(() => {
    setFormEnabled(false)
    console.log('nameList', nameList)
    const names = nameList.split(/\n/)
    console.log('names', names)
    const nonBlank = names.filter((s) => s != '')
    console.log('nonBlank', nonBlank)
    if (names.length < 1) {
      console.log('No names provided')
      setFormErrorMessage('No names provided')
      setFormEnabled(true)
      return
    }
    console.log('Names', names)
    setFormEnabled(true)
  }, [setNameList, setFormErrorMessage])

  const handleNamelistChange = useCallback((value: string) => {
    setFormErrorMessage('')
    setNameList(value)
  }, [])

  return (
    <Form onSubmit={handleSubmit}>
      <FormLayout>
        <TextField
          value={nameList}
          error={formErrorMessage}
          onChange={handleNamelistChange}
          label="Names"
          autoComplete="off"
          multiline={10}
          helpText={<span>Seperate name parts with pipes if needed.</span>}
        />

        <Button submit disabled={!formEnabled}>
          Submit
        </Button>
      </FormLayout>
    </Form>
  )
}
