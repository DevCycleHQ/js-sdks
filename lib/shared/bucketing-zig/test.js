const { instantiate, VariableType } = require('./index.js');

async function runTests() {
    console.log('Loading WASM module...');
    
    try {
        const bucketing = await instantiate(true);
        console.log('✓ WASM module loaded successfully');
        
        // Test 1: Generate bounded hashes
        console.log('\nTest 1: Generate bounded hashes');
        const hashes = bucketing.generateBoundedHashesFromJSON('test_user', 'test_target');
        console.log('Bounded hashes result:', hashes);
        console.log('✓ Bounded hashes generated successfully');
        
        // Test 2: Set platform data
        console.log('\nTest 2: Set platform data');
        const platformData = {
            platform: 'NodeJS',
            platformVersion: '16.0',
            sdkType: 'server',
            sdkVersion: '1.0',
            hostname: 'test-host'
        };
        bucketing.setPlatformData(JSON.stringify(platformData));
        console.log('✓ Platform data set successfully');
        
        // Test 3: Set config data
        console.log('\nTest 3: Set config data');
        const configData = {
            project: {
                _id: 'test_project',
                key: 'test_project_key'
            },
            environment: {
                _id: 'test_env',
                key: 'test_env_key'
            },
            features: [],
            variables: [
                {
                    _id: 'test_var',
                    key: 'test_variable',
                    type: 'Boolean'
                }
            ]
        };
        bucketing.setConfigData('test_sdk_key', JSON.stringify(configData));
        console.log('✓ Config data set successfully');
        
        // Test 4: Set client custom data
        console.log('\nTest 4: Set client custom data');
        const customData = {
            custom_property: 'custom_value',
            another_property: 123
        };
        bucketing.setClientCustomData('test_sdk_key', JSON.stringify(customData));
        console.log('✓ Client custom data set successfully');
        
        // Test 5: Generate bucketed config for user
        console.log('\nTest 5: Generate bucketed config for user');
        const userData = {
            user_id: 'test_user_123',
            email: 'test@example.com',
            country: 'CA'
        };
        const bucketedConfig = bucketing.generateBucketedConfigForUser('test_sdk_key', JSON.stringify(userData));
        console.log('Bucketed config result:', bucketedConfig);
        console.log('✓ Bucketed config generated successfully');
        
        // Test 6: Get variable for user
        console.log('\nTest 6: Get variable for user');
        const variable = bucketing.variableForUser(
            'test_sdk_key',
            JSON.stringify(userData),
            'test_variable',
            VariableType.Boolean,
            false
        );
        console.log('Variable result:', variable);
        console.log('✓ Variable for user retrieved successfully');
        
        // Test 7: Clear platform data
        console.log('\nTest 7: Clear platform data');
        bucketing.clearPlatformData();
        console.log('✓ Platform data cleared successfully');
        
        // Cleanup
        bucketing.cleanup();
        console.log('\n✓ All tests passed! WASM module is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the tests
runTests().catch(console.error);