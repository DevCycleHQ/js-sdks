describe('js-cloud-server', () => {
    it('should return all variables', async () => {
        const response = await fetch('http://localhost:63768')
        const variablesResponse = await response.json()

        expect(variablesResponse).toMatchObject({
            variables: {
                enabledFeature: true,
                disabledFeature: false,
                testFeature: true,
            },
        })
    })
})
