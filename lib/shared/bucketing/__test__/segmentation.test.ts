/* eslint-disable max-len */
import clone from 'lodash/clone'
import * as assert from 'assert'
import * as segmentation from '../src/segmentation'
import {
  Audience,
  AudienceFilterOrOperator,
  AudienceOperator,
  FilterComparator,
  FilterType,
  TopLevelOperator,
  UserSubType,
} from '@devcycle/types'

describe('SegmentationManager Unit Test', () => {
  // TODO update and uncomment these tests when we incorporate list audiences
  // describe('listAudience filters', () => {
  //     it('passes segmentation for single list audience', () => {
  //         const filters = [{
  //             _id: 'some_id',
  //             type: 'listAudience',
  //             comparator: '=',
  //             values: [{
  //                 _listAudience: 'test1',
  //                 version: '2'
  //             }]
  //         }]
  //         const appUser = {
  //             listAudienceSegmentation: [
  //                 {
  //                     _listAudience: 'test1',
  //                     version: '1'
  //                 }, {
  //                     _listAudience: 'test1',
  //                     version: '2'
  //                 }, {
  //                     _listAudience: 'test2',
  //                     version: '1'
  //                 }]
  //         }
  //
  //         expect(segmentation.evaluateFilters({ filters, data: appUser })).toBe(true)
  //     })
  //
  //     it('passes segmentation for multiple value list audience', () => {
  //         const filters = [{
  //             _id: 'some_id',
  //             type: 'listAudience',
  //             comparator: '=',
  //             values: [{
  //                 _listAudience: 'test1',
  //                 version: '2'
  //             }, {
  //                 _listAudience: 'test1',
  //                 version: '17'
  //             }]
  //         }]
  //         const appUser = {
  //             listAudienceSegmentation: [
  //                 {
  //                     _listAudience: 'test1',
  //                     version: '1'
  //                 }, {
  //                     _listAudience: 'test1',
  //                     version: '2'
  //                 }, {
  //                     _listAudience: 'test2',
  //                     version: '1'
  //                 }]
  //         }
  //
  //         expect(segmentation.evaluateFilters({ filters, data: appUser })).toBe(true)
  //     })
  //
  //     it('passes segmentation for not in list audience', () => {
  //         const filters = [{
  //             _id: 'some_id',
  //             type: 'listAudience',
  //             comparator: '!=',
  //             values: [{
  //                 _listAudience: 'test1',
  //                 version: '14'
  //             }, {
  //                 _listAudience: 'test1',
  //                 version: '17'
  //             }]
  //         }]
  //         const appUser = {
  //             listAudienceSegmentation: [
  //                 {
  //                     _listAudience: 'test1',
  //                     version: '1'
  //                 }, {
  //                     _listAudience: 'test1',
  //                     version: '2'
  //                 }, {
  //                     _listAudience: 'test2',
  //                     version: '1'
  //                 }]
  //         }
  //
  //         expect(segmentation.evaluateFilters({ filters, data: appUser })).toBe(true)
  //     })
  //
  //     it('fails segmentation for not in list audience while IN list audience', () => {
  //         const filters = [{
  //             _id: 'some_id',
  //             type: 'listAudience',
  //             comparator: '!=',
  //             values: [{
  //                 _listAudience: 'test1',
  //                 version: '2'
  //             }, {
  //                 _listAudience: 'test1',
  //                 version: '17'
  //             }]
  //         }]
  //         const appUser = {
  //             listAudienceSegmentation: [
  //                 {
  //                     _listAudience: 'test1',
  //                     version: '1'
  //                 }, {
  //                     _listAudience: 'test1',
  //                     version: '2'
  //                 }, {
  //                     _listAudience: 'test2',
  //                     version: '1'
  //                 }]
  //         }
  //
  //         expect(segmentation.evaluateFilters({ filters, data: appUser })).toBe(false)
  //     })
  //
  //     it('fails segmentation for in list audience while NOT IN list audience', () => {
  //         const filters = [{
  //             _id: 'some_id',
  //             type: 'listAudience',
  //             comparator: '=',
  //             values: [{
  //                 _listAudience: 'test1',
  //                 version: '14'
  //             }, {
  //                 _listAudience: 'test1',
  //                 version: '17'
  //             }]
  //         }]
  //         const appUser = {
  //             listAudienceSegmentation: [
  //                 {
  //                     _listAudience: 'test1',
  //                     version: '1'
  //                 }, {
  //                     _listAudience: 'test1',
  //                     version: '2'
  //                 }, {
  //                     _listAudience: 'test2',
  //                     version: '1'
  //                 }]
  //         }
  //
  //         expect(segmentation.evaluateFilters({ filters, data: appUser })).toBe(false)
  //     })
  //
  //     it('throws error when filters not prepared', () => {
  //         const filters = [{
  //             _id: 'some_id',
  //             type: 'listAudience',
  //             comparator: '!=',
  //             values: ['test1']
  //         }]
  //         const appUser = {
  //             listAudienceSegmentation: [
  //                 {
  //                     _listAudience: 'test1',
  //                     version: '1'
  //                 }, {
  //                     _listAudience: 'test1',
  //                     version: '2'
  //                 }, {
  //                     _listAudience: 'test2',
  //                     version: '1'
  //                 }]
  //         }
  //         try {
  //             segmentation.evaluateFilters({ filters, data: appUser })
  //         } catch (e) {
  //             expect(e.message).toBe('ListAudience filter must be an object, has not been prepared for segmentation')
  //             return
  //         }
  //
  //         throw new Error()
  //     })
  // })

  const featureId = 'testID'
  const isOptInEnabled = false

  describe('evaluateOperator', () => {
    it('should fail for empty filters', () => {
      const filters: Record<string, unknown>[] = []

      const operator: TopLevelOperator = {
        filters,
        operator: AudienceOperator.and,
      }

      const data = {
        country: 'Canada',
        email: 'brooks@big.lunch',
        platformVersion: '2.0.0',
        platform: 'iOS',
      }
      assert.strictEqual(
        false,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
      const orOp: TopLevelOperator = {
        filters,
        operator: AudienceOperator.or,
      }
      assert.strictEqual(
        false,
        segmentation.evaluateOperator({
          data: {},
          operator: orOp,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for all filter', () => {
      const filters = [
        {
          type: 'all',
          comparator: '=',
          values: [],
        },
      ] as AudienceFilterOrOperator[]

      const operator: TopLevelOperator = {
        filters,
        operator: AudienceOperator.and,
      }

      const data = {
        country: 'Canada',
        email: 'brooks@big.lunch',
        platformVersion: '2.0.0',
        platform: 'iOS',
      }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should work for an AND operator', () => {
      const filters = [
        {
          type: 'user',
          subType: 'country',
          comparator: '=',
          values: ['Canada'],
        },
        {
          type: 'user',
          subType: 'email',
          comparator: '=',
          values: ['dexter@smells.nice', 'brooks@big.lunch'],
        },
        {
          type: 'user',
          subType: 'appVersion',
          comparator: '>',
          values: ['1.0.0'],
        },
      ] as AudienceFilterOrOperator[]

      const operator: TopLevelOperator = {
        filters,
        operator: AudienceOperator.and,
      }

      const data = {
        country: 'Canada',
        email: 'brooks@big.lunch',
        platformVersion: '2.0.0',
        appVersion: '2.0.2',
        platform: 'iOS',
      }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should work for an OR operator', () => {
      const filters = [
        {
          type: 'user',
          subType: 'country',
          comparator: '=',
          values: ['Canada'],
        },
        {
          type: 'user',
          subType: 'email',
          comparator: '=',
          values: ['dexter@smells.nice', 'brooks@big.lunch'],
        },
        {
          type: 'user',
          subType: 'appVersion',
          comparator: '>',
          values: ['1.0.0'],
        },
      ] as AudienceFilterOrOperator[]

      const operator: TopLevelOperator = {
        filters,
        operator: AudienceOperator.or,
      }

      const data = {
        country: 'whomp',
        email: 'fake@email.com',
        platformVersion: '2.0.0',
        appVersion: '2.0.2',
        platform: 'iOS',
      }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should work for an AND operator containing a custom data filter', () => {
      const filters = [
        {
          type: 'user',
          subType: 'country',
          comparator: '=',
          values: ['Canada'],
        },
        {
          type: 'user',
          subType: 'customData',
          datakey: '',
          comparator: '=',
          values: ['Canada'],
        },
      ] as AudienceFilterOrOperator[]

      const operator: TopLevelOperator = {
        filters,
        operator: AudienceOperator.and,
      }

      const data = {
        country: 'Canada',
        email: 'brooks@big.lunch',
        appVersion: '2.0.0',
        platform: 'iOS',
      }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for user_id filter', () => {
      const operator = {
        filters: [
          {
            type: 'user',
            subType: 'user_id',
            comparator: '=',
            values: ['test_user'],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const data = { user_id: 'test_user' }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for email filter', () => {
      const operator = {
        filters: [
          {
            type: 'user',
            subType: 'email',
            comparator: '=',
            values: ['test@devcycle.com'],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const data = { email: 'test@devcycle.com' }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for country filter', () => {
      const operator = {
        filters: [
          {
            type: 'user',
            subType: 'country',
            comparator: '=',
            values: ['CA'],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const data = { country: 'CA' }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for appVersion filter', () => {
      const operator = {
        filters: [
          {
            type: 'user',
            subType: 'appVersion',
            comparator: '=',
            values: ['1.0.1'],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const data = { appVersion: '1.0.1' }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for platformVersion filter', () => {
      const operator = {
        filters: [
          {
            type: 'user',
            subType: 'platformVersion',
            comparator: '>=',
            values: ['15.1'],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const data = { platformVersion: '15.1' }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for platform filter', () => {
      const operator = {
        filters: [
          {
            type: 'user',
            subType: 'platform',
            comparator: '=',
            values: ['iOS', 'iPadOS', 'tvOS'],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const data = { platform: 'iPadOS' }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for deviceModel filter', () => {
      const operator = {
        filters: [
          {
            type: 'user',
            subType: 'deviceModel',
            comparator: '=',
            values: ['Samsung Galaxy F12'],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const data = { deviceModel: 'Samsung Galaxy F12' }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for customData filter', () => {
      const operator = {
        filters: [
          {
            type: 'user',
            subType: 'customData',
            dataKey: 'testKey',
            dataKeyType: 'String',
            comparator: '=',
            values: ['dataValue'],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const data = { customData: { testKey: 'dataValue' } }
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for customData filter != multiple values', () => {
      const operator = {
        filters: [
          {
            type: 'user',
            subType: 'customData',
            dataKey: 'testKey',
            dataKeyType: 'String',
            comparator: '!=',
            values: ['dataValue', 'dataValue2'],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const data = { customData: { testKey: 'dataValue' } }
      assert.strictEqual(
        false,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for private customData filter != multiple values', () => {
      const operator = {
        filters: [
          {
            type: 'user',
            subType: 'customData',
            dataKey: 'testKey',
            dataKeyType: 'String',
            comparator: '!=',
            values: ['dataValue', 'dataValue2'],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const data = { privateCustomData: { testKey: 'dataValue' } }
      assert.strictEqual(
        false,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should pass for customData filter does not contain multiple values', () => {
      const operator = {
        filters: [
          {
            type: 'user',
            subType: 'customData',
            dataKey: 'testKey',
            dataKeyType: 'String',
            comparator: '!contain',
            values: ['dataValue', 'otherValue'],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const data = { customData: { testKey: 'otherValue' } }
      assert.strictEqual(
        false,
        segmentation.evaluateOperator({
          data,
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    describe('evaluateOperator with optIn filter', () => {
      const optInOperator = {
        filters: [
          {
            type: 'optIn',
            comparator: '=',
            values: [],
          },
        ] as AudienceFilterOrOperator[],
        operator: 'and',
      } as TopLevelOperator

      const optInData = {
        country: 'Canada',
        email: 'brooks@big.lunch',
        platformVersion: '2.0.0',
        platform: 'iOS',
        optIns: {
          testFeature: true,
        },
      }

      it('should pass optIn filter when feature in optIns and isOptInEnabled', () => {
        assert.strictEqual(
          true,
          segmentation.evaluateOperator({
            data: optInData,
            operator: optInOperator,
            featureId: 'testFeature',
            isOptInEnabled: true,
          }),
        )
      })

      it('should fail optIn filter when feature in optIns but isOptInEnabled is false', () => {
        assert.strictEqual(
          false,
          segmentation.evaluateOperator({
            data: optInData,
            operator: optInOperator,
            featureId: 'testFeature',
            isOptInEnabled: false,
          }),
        )
      })

      it('should fail optIn filter when feature not in optIns', () => {
        assert.strictEqual(
          false,
          segmentation.evaluateOperator({
            data: optInData,
            operator: optInOperator,
            featureId: 'featureNotInOptins',
            isOptInEnabled: true,
          }),
        )
      })
    })

    describe('evaluateOperator should handle audienceMatch filter', () => {
      const filters = [
        {
          type: FilterType.user,
          subType: UserSubType.country,
          comparator: FilterComparator['='],
          values: ['Canada'],
        },
        {
          type: FilterType.user,
          subType: UserSubType.email,
          comparator: FilterComparator['='],
          values: ['dexter@smells.nice', 'brooks@big.lunch'],
        },
        {
          type: FilterType.user,
          subType: UserSubType.appVersion,
          comparator: FilterComparator['>'],
          values: ['1.0.0'],
        },
      ]
      const operator = {
        filters,
        operator: AudienceOperator.and,
      }
      const data = {
        country: 'Canada',
        email: 'brooks@big.lunch',
        platformVersion: '2.0.0',
        appVersion: '2.0.2',
        platform: 'iOS',
      }
      const audienceMatchOperator = {
        filters: [
          {
            type: FilterType.audienceMatch,
            comparator: FilterComparator['='],
            _audiences: ['test'],
          },
        ],
        operator: AudienceOperator.and,
      }

      const audienceMatchOperatorNotEqual = {
        filters: [
          {
            type: FilterType.audienceMatch,
            comparator: FilterComparator['!='],
            _audiences: ['test'],
          },
        ],
        operator: AudienceOperator.and,
      }
      it('should pass seg for happy path case', () => {
        const audiences = {
          test: {
            filters: operator,
          },
        }
        assert.strictEqual(
          true,
          segmentation.evaluateOperator({
            data,
            operator: audienceMatchOperator,
            audiences,
            featureId,
            isOptInEnabled,
          }),
        )
      })

      it('should not pass seg for nonexistent audience', () => {
        assert.strictEqual(
          false,
          segmentation.evaluateOperator({
            data,
            operator: audienceMatchOperator,
            audiences: {},
            featureId,
            isOptInEnabled,
          }),
        )
      })
      it('should not pass seg when not in audience for happy path case', () => {
        const audiences = {
          test: {
            filters: operator,
          },
        }

        assert.strictEqual(
          false,
          segmentation.evaluateOperator({
            data,
            operator: audienceMatchOperatorNotEqual,
            audiences,
            featureId,
            isOptInEnabled,
          }),
        )
      })
      it('should pass seg for nested audiences', () => {
        const nestedAudienceMatchOperator = {
          filters: [
            {
              type: FilterType.audienceMatch,
              comparator: FilterComparator['='],
              _audiences: ['nested'],
            },
          ],
          operator: AudienceOperator.and,
        }

        const audiences = {
          test: {
            filters: operator,
          },
          nested: {
            filters: audienceMatchOperator,
          },
        }
        assert.strictEqual(
          true,
          segmentation.evaluateOperator({
            data,
            operator: nestedAudienceMatchOperator,
            audiences,
            featureId,
            isOptInEnabled,
          }),
        )
      })
      it('should not pass seg for nested audiences with !=', () => {
        const nestedAudienceMatchOperator = {
          filters: [
            {
              type: FilterType.audienceMatch,
              comparator: FilterComparator['!='],
              _audiences: ['nested'],
            },
          ],
          operator: AudienceOperator.and,
        }

        const audiences = {
          test: {
            filters: operator,
          },
          nested: {
            filters: audienceMatchOperator,
          },
        }
        assert.strictEqual(
          false,
          segmentation.evaluateOperator({
            data,
            operator: nestedAudienceMatchOperator,
            audiences,
            featureId,
            isOptInEnabled,
          }),
        )
      })
      it('should pass seg for an AND operator with multiple values', () => {
        const filters = [
          {
            type: FilterType.user,
            subType: UserSubType.country,
            comparator: FilterComparator['='],
            values: ['USA'],
          },
        ]

        const audiences = {
          test: {
            filters: operator,
          },
          test2: {
            filters: {
              filters,
              operator: AudienceOperator.and,
            },
          },
        }
        const audienceMatchOperatorMultiple = {
          filters: [
            {
              type: FilterType.audienceMatch,
              comparator: FilterComparator['='],
              _audiences: ['test', 'test2'],
            },
          ],
          operator: AudienceOperator.and,
        }
        assert.strictEqual(
          true,
          segmentation.evaluateOperator({
            data,
            operator: audienceMatchOperatorMultiple,
            audiences,
            featureId,
            isOptInEnabled,
          }),
        )
      })
      it('should not pass seg for an AND operator with multiple values', () => {
        const filters = [
          {
            type: FilterType.user,
            subType: UserSubType.country,
            comparator: FilterComparator['='],
            values: ['USA'],
          },
        ]

        const audiences = {
          test: {
            filters: operator,
          },
          test2: {
            filters: {
              filters,
              operator: AudienceOperator.and,
            },
          },
        }
        const audienceMatchOperatorMultiple = {
          filters: [
            {
              type: FilterType.audienceMatch,
              comparator: FilterComparator['!='],
              _audiences: ['test', 'test2'],
            },
          ],
          operator: AudienceOperator.and,
        }
        assert.strictEqual(
          false,
          segmentation.evaluateOperator({
            data,
            operator: audienceMatchOperatorMultiple,
            audiences,
            featureId,
            isOptInEnabled,
          }),
        )
      })
    })
  })

  describe('checkStringsFilter', () => {
    it('should return false if filter and no value', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: [1, 2],
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkStringsFilter(null, filter))
    })
    it('should return false if exists filter and no value', () => {
      const filter = {
        type: 'user',
        comparator: 'exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkStringsFilter(null, filter))
      assert.strictEqual(false, segmentation.checkStringsFilter('', filter))
    })
    it('should return true if exists filter and value', () => {
      const filter = {
        type: 'user',
        comparator: 'exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(
        true,
        segmentation.checkStringsFilter('string', filter),
      )
    })
    it('should return true if not exists filter and no value', () => {
      const filter = {
        type: 'user',
        comparator: '!exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkStringsFilter(null, filter))
      assert.strictEqual(true, segmentation.checkStringsFilter('', filter))
    })
    it('should return false if not exists filter and value', () => {
      const filter = {
        type: 'user',
        comparator: '!exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(
        false,
        segmentation.checkStringsFilter('string', filter),
      )
    })
    it('should return false if contains filter and no value', () => {
      const filter = {
        type: 'user',
        comparator: 'contain',
        values: ['hello'],
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkStringsFilter(null, filter))
    })
    it('should return true if browser filter works', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: ['Chrome'],
      } as AudienceFilterOrOperator
      assert.strictEqual(
        true,
        segmentation.checkStringsFilter('Chrome', filter),
      )
    })
    it('should return true if browser device type filter works', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: ['Desktop'],
      } as AudienceFilterOrOperator
      assert.strictEqual(
        true,
        segmentation.checkStringsFilter('Desktop', filter),
      )
    })
    it('should return true if contains filter and value contains', () => {
      const filter = {
        type: 'user',
        comparator: 'contain',
        values: ['hello'],
      } as AudienceFilterOrOperator
      assert.strictEqual(
        true,
        segmentation.checkStringsFilter('helloWorld', filter),
      )
    })
    it('should return false if contains filter and value does not contain', () => {
      const filter = {
        type: 'user',
        comparator: 'contain',
        values: ['hello'],
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkStringsFilter('xy', filter))
    })
    it('should return true if not contains filter and no value', () => {
      const filter = {
        type: 'user',
        comparator: '!contain',
        values: ['hello'],
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkStringsFilter(null, filter))
    })
    it('should return true if not contains filter and value', () => {
      const filter = {
        type: 'user',
        comparator: '!contain',
        values: ['hello'],
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkStringsFilter('xy', filter))
    })
    it('should return false if not contains filter and not value', () => {
      const filter = {
        type: 'user',
        comparator: '!contain',
        values: ['hello'],
      } as AudienceFilterOrOperator
      assert.strictEqual(
        false,
        segmentation.checkStringsFilter('hello', filter),
      )
    })

    it('should return false if string is not a string', () => {
      assert.strictEqual(false, segmentation.checkStringsFilter(1, {}))
    })
    it('should return false if filter value is not a string', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: [1, 2],
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkStringsFilter('Male', filter))
    })
    it('should return true if string is equal', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: ['Male'],
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkStringsFilter('Male', filter))
    })
    it('should return false if string is not equal', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: ['Male'],
      } as AudienceFilterOrOperator
      assert.strictEqual(
        false,
        segmentation.checkStringsFilter('Female', filter),
      )
    })
    it('should return true if string is one of multiple values', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: ['iPhone OS', 'Android'],
      } as AudienceFilterOrOperator
      assert.strictEqual(
        true,
        segmentation.checkStringsFilter('iPhone OS', filter),
      )
    })
    it('should return true if string is not one of multiple values', () => {
      const filter = {
        type: 'user',
        comparator: '!=',
        values: ['iPhone OS', 'Android', 'Android TV', 'web'],
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkStringsFilter('Roku', filter))
    })
    it('should return true if string is equal to multiple filters', () => {
      const filters = [
        {
          type: 'user',
          subType: 'country',
          comparator: '=',
          values: ['Canada'],
        },
        {
          type: 'user',
          subType: 'country',
          comparator: '!=',
          values: ['Not Canada'],
        },
      ] as AudienceFilterOrOperator[]

      const operator = {
        filters,
        operator: 'and',
      } as unknown as TopLevelOperator

      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data: { country: 'Canada' },
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should return false if string is not equal to multiple filters', () => {
      const filters = [
        {
          type: 'user',
          subType: 'country',
          comparator: '=',
          values: ['Canada'],
        },
        {
          type: 'user',
          subType: 'country',
          comparator: '=',
          values: ['Not Canada'],
        },
      ] as AudienceFilterOrOperator[]

      const operator = {
        filters,
        operator: 'and',
      } as unknown as TopLevelOperator

      assert.strictEqual(
        false,
        segmentation.evaluateOperator({
          data: { country: 'Canada' },
          operator,
          featureId,
          isOptInEnabled,
        }),
      )
    })
  })

  describe('checkBooleanFilter', () => {
    it('should return false if exists filter and no value', () => {
      const filter = {
        type: 'user',
        comparator: 'exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkBooleanFilter(null, filter))
      assert.strictEqual(false, segmentation.checkBooleanFilter(10, filter))
    })
    it('should return true if exists filter and value', () => {
      const filter = {
        type: 'user',
        comparator: 'exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkBooleanFilter(true, filter))
      assert.strictEqual(true, segmentation.checkBooleanFilter(false, filter))
    })
    it('should return true if not exists filter and no value', () => {
      const filter = {
        type: 'user',
        comparator: '!exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkBooleanFilter(null, filter))
      assert.strictEqual(true, segmentation.checkBooleanFilter(10, filter))
    })
    it('should return false if not exists filter and value', () => {
      const filter = {
        type: 'user',
        comparator: '!exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkBooleanFilter(true, filter))
      assert.strictEqual(false, segmentation.checkBooleanFilter(false, filter))
    })
    it('should return false if filters value is not a boolean', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: ['hi1', 'hi2'],
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkBooleanFilter(true, filter))
    })
    it('should return true if filers value equals boolean', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: [true],
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkBooleanFilter(true, filter))
    })
    it('should return false if filers value does not equals boolean', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: [true],
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkBooleanFilter(false, filter))
    })
    it('should return false if filers value equals boolean', () => {
      const filter = {
        type: 'user',
        comparator: '!=',
        values: [true],
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkBooleanFilter(true, filter))
    })
    it('should return true if filers value does not equals boolean', () => {
      const filter = {
        type: 'user',
        comparator: '!=',
        values: [true],
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkBooleanFilter(false, filter))
    })
  })

  describe('checkNumbersFilter', () => {
    it('should return false if filter and no number', () => {
      assert.strictEqual(false, segmentation.checkNumbersFilter(null, {}))
    })
    it('should return false if exists filter and no number', () => {
      const filter = {
        type: 'user',
        comparator: 'exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkNumbersFilter(null, filter))
      assert.strictEqual(false, segmentation.checkNumbersFilter('str', filter))
    })
    it('should return true if exists filter and number', () => {
      const filter = {
        type: 'user',
        comparator: 'exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkNumbersFilter(10, filter))
    })
    it('should return true if not exists filter and no number', () => {
      const filter = {
        type: 'user',
        comparator: '!exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkNumbersFilter(null, filter))
      assert.strictEqual(true, segmentation.checkNumbersFilter('str', filter))
    })
    it('should return false if not exists filter and number', () => {
      const filter = {
        type: 'user',
        comparator: '!exist',
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkNumbersFilter(10, filter))
    })

    it('should return false if filter value is not a number', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: ['hi1', 'hi2'],
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkNumbersFilter(10, filter))
    })
    it('should return true if values does not equal filter values', () => {
      const filter = {
        type: 'user',
        comparator: '!=',
        values: [10, 11],
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkNumbersFilter(12, filter))
    })
    it('should return true if values does not equal filter values', () => {
      const filter = {
        type: 'user',
        comparator: '!=',
        values: [10, 11],
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkNumbersFilter(12, filter))
    })
    it('should return true if number is equal', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: [10],
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkNumbersFilter(10, filter))
    })
    it('should return false if number is not equal', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: [10],
      } as AudienceFilterOrOperator
      assert.strictEqual(false, segmentation.checkNumbersFilter(11, filter))
    })
    it('should return false if number is equal to a OR values', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: [10, 11],
      } as AudienceFilterOrOperator
      assert.strictEqual(true, segmentation.checkNumbersFilter(11, filter))
    })
  })

  describe('checkNumberFilter', () => {
    it('should return false if operator is not valid', () => {
      assert.strictEqual(false, segmentation.checkNumberFilter(0, [0], '=11'))
      assert.strictEqual(
        false,
        segmentation.checkNumberFilter(0, [0], 0 as unknown as string),
      )
    })
    it('should return true if values are equal', () => {
      assert.strictEqual(true, segmentation.checkNumberFilter(0, [0], '='))
      assert.strictEqual(true, segmentation.checkNumberFilter(10, [10], '='))
      assert.strictEqual(true, segmentation.checkNumberFilter(10, [0, 10], '='))
    })
    it('should return false if values are not equal', () => {
      assert.strictEqual(false, segmentation.checkNumberFilter(0, [10], '='))
      assert.strictEqual(
        false,
        segmentation.checkNumberFilter(10, [-10, -12], '='),
      )
    })
    it('should return true if values are not equal', () => {
      assert.strictEqual(true, segmentation.checkNumberFilter(0, [10], '!='))
      assert.strictEqual(
        true,
        segmentation.checkNumberFilter(10, [-10, -12], '!='),
      )
    })
    it('should return true if values are not equal', () => {
      assert.strictEqual(false, segmentation.checkNumberFilter(10, [10], '!='))
    })
    it('should return true if values are greater than', () => {
      assert.strictEqual(true, segmentation.checkNumberFilter(0, [-1], '>'))
      assert.strictEqual(true, segmentation.checkNumberFilter(10, [1, 5], '>'))
    })
    it('should return false if values are not greater than', () => {
      assert.strictEqual(false, segmentation.checkNumberFilter(0, [10], '>'))
      assert.strictEqual(false, segmentation.checkNumberFilter(10, [10], '>'))
    })
    it('should return true if values are greater than or equal', () => {
      assert.strictEqual(true, segmentation.checkNumberFilter(0, [-1], '>='))
      assert.strictEqual(true, segmentation.checkNumberFilter(10, [1], '>='))
      assert.strictEqual(true, segmentation.checkNumberFilter(10, [10], '>='))
    })
    it('should return false if values are not greater than or equal', () => {
      assert.strictEqual(false, segmentation.checkNumberFilter(0, [10], '>='))
      assert.strictEqual(false, segmentation.checkNumberFilter(10, [11], '>='))
    })
    it('should return true if values are less than', () => {
      assert.strictEqual(true, segmentation.checkNumberFilter(-1, [0], '<'))
      assert.strictEqual(true, segmentation.checkNumberFilter(1, [10], '<'))
    })
    it('should return false if values are not less than', () => {
      assert.strictEqual(false, segmentation.checkNumberFilter(10, [0], '<'))
      assert.strictEqual(false, segmentation.checkNumberFilter(10, [10], '<'))
    })
    it('should return true if values are less than or equal', () => {
      assert.strictEqual(true, segmentation.checkNumberFilter(-1, [0], '<='))
      assert.strictEqual(true, segmentation.checkNumberFilter(1, [10], '<='))
      assert.strictEqual(true, segmentation.checkNumberFilter(10, [10], '<='))
    })
    it('should return false if values are not less than or equal', () => {
      assert.strictEqual(false, segmentation.checkNumberFilter(10, [0], '<='))
      assert.strictEqual(false, segmentation.checkNumberFilter(11, [10], '<='))
    })
  })

  // TODO update and uncomment these tests when we incorporate list audiences
  // describe('checkListAudienceFilters', () => {
  //     const data = [
  //         {
  //             _listAudience: 'test1',
  //             version: '1'
  //         }, {
  //             _listAudience: 'test1',
  //             version: '2'
  //         }, {
  //             _listAudience: 'test2',
  //             version: '1'
  //         }]
  //     it('should return true if user in listAudience for equality', () => {
  //         const comparator = '='
  //         const values = [{
  //             _listAudience: 'test1',
  //             version: '2'
  //         }]
  //
  //         assert.strictEqual(true, segmentation.checkListAudienceFilter({ data, values, comparator }))
  //     })
  //     it('should return false if user not in listAudience for equality', () => {
  //         const comparator = '='
  //         const values = [{
  //             _listAudience: 'test1',
  //             version: '3'
  //         }]
  //
  //         assert.strictEqual(false, segmentation.checkListAudienceFilter({ data, values, comparator }))
  //     })
  //
  //     it('should return true if user not in listAudience for inequality', () => {
  //         const comparator = '!='
  //         const values = [{
  //             _listAudience: 'test1',
  //             version: '3'
  //         }]
  //
  //         assert.strictEqual(true, segmentation.checkListAudienceFilter({ data, values, comparator }))
  //     })
  //
  //     it('should return false if user in listAudience for inequality', () => {
  //         const comparator = '!='
  //         const values = [{
  //             _listAudience: 'test1',
  //             version: '2'
  //         }]
  //
  //         assert.strictEqual(false, segmentation.checkListAudienceFilter({ data, values, comparator }))
  //     })
  //
  //     it('should throw error if filter not prepared for segmentation', () => {
  //         const comparator = '='
  //         const values = ['test1']
  //         try {
  //             segmentation.checkListAudienceFilter({ data, values, comparator })
  //         } catch (e) {
  //             assert.strictEqual(e.message, 'ListAudience filter must be an object, has not been prepared for segmentation')
  //             return
  //         }
  //         throw new Error()
  //     })
  // })

  describe('checkVersionFilters', () => {
    it('should return false if filter and version is null', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: ['1.1.2', '1.1.3'],
      } as AudienceFilterOrOperator
      const filter1 = {
        type: 'user',
        comparator: '>=',
        values: ['1.1.2', '1.1.3'],
      } as AudienceFilterOrOperator
      assert.strictEqual(
        false,
        segmentation.checkVersionFilters(null as unknown as string, filter),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilters(null as unknown as string, filter1),
      )
    })
    it('should return true if filter equals version', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: ['1.1.2', '1.1.3'],
      } as AudienceFilterOrOperator
      assert.strictEqual(
        true,
        segmentation.checkVersionFilters('1.1.2', filter),
      )
    })
    it('should return true if filter greater than or equals version', () => {
      const filter = {
        type: 'user',
        comparator: '>=',
        values: ['1.1.2', '1.1.3'],
      } as AudienceFilterOrOperator
      assert.strictEqual(
        true,
        segmentation.checkVersionFilters('1.1.2', filter),
      )
    })
    it('should return true if filter equals version non semver', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: ['1.1.2.12'],
      } as AudienceFilterOrOperator
      const filter2 = {
        type: 'user',
        comparator: '=',
        values: ['31.331.2222.12'],
      } as AudienceFilterOrOperator
      const filter3 = {
        type: 'user',
        comparator: '=',
        values: ['1.1.2.12.1.2.3'],
      } as AudienceFilterOrOperator
      assert.strictEqual(
        true,
        segmentation.checkVersionFilters('1.1.2.12', filter),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilters('31.331.2222.12', filter2),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilters('1.1.2.12.1.2.3', filter3),
      )
    })
    it('should return false if filter does not equals version', () => {
      const filter = {
        type: 'user',
        comparator: '=',
        values: ['1.1.1'],
      } as AudienceFilterOrOperator
      assert.strictEqual(
        false,
        segmentation.checkVersionFilters('1.1.2', filter),
      )
    })
  })

  describe('checkVersionFilter', () => {
    it('should return true if string versions equal', () => {
      assert.strictEqual(true, segmentation.checkVersionFilter('1', ['1'], '='))
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.1'], '='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.1', ['1.1.1'], '='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.', ['1.1'], '='),
      )
    })
    it('should return false if string versions not equal', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter(null as unknown as string, ['2'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['2'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.2'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.1.1'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.', ['1.1.1'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.1', ['1.1'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.1', ['1.1.'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.1', ['1.2.3'], '='),
      )
    })
    it('should return false if string versions not equal', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['1'], '!='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.1'], '!='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.1', ['1.1.1'], '!='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.', ['1.1'], '!='),
      )
    })
    it('should return true if string versions not equal', () => {
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1', ['2'], '!='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.2'], '!='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.1.1'], '!='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.', ['1.1.1'], '!='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.1', ['1.1'], '!='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.1', ['1.1.'], '!='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.1', ['1.2.3'], '!='),
      )
    })
    it('should return true if string versions greater than', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter(null as unknown as string, ['1'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['1'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.1'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.1', ['1.1.1'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.', ['1.1'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['2'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.2'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.1.1'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.', ['1.1.1'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.1', ['1.2.3'], '>'),
      )
    })
    it('should return true if string versions greater than', () => {
      assert.strictEqual(true, segmentation.checkVersionFilter('2', ['1'], '>'))
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2', ['1.1'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('2.1', ['1.1'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.1', ['1.2'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.', ['1.1'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.1', ['1.1.1'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.2', ['1.2'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.2', ['1.2.1'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241', ['4.8'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.2'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.241.0'], '>'),
      )
    })
    it('should return true if string versions greater than or equal', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter(null as unknown as string, ['2'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['2'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.2'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.1.1'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.', ['1.1.1'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.1', ['1.2.3'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('4.8.241', ['4.9'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('4.8.241.2', ['5'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('4.8.241.2', ['4.9'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.242'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.241.5'], '>='),
      )
    })
    it('should return true if string versions greater than or equal', () => {
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1', ['1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.1', ['1.1.1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.', ['1.1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('2', ['1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2', ['1.1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('2.1', ['1.1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.1', ['1.2'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.', ['1.1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.1', ['1.1.1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.2', ['1.2'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.2', ['1.2.1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.2'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.241.0'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.241.2'], '>='),
      )
    })
    it('should work if version has other characters', () => {
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.2', ['v1.2.1-2v3asda'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.2', ['v1.2.1-va1sda'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.1', ['v1.2.1-vasd32a'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.1', ['v1.2.1-vasda'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter(
          'v1.2.1-va21sda',
          ['v1.2.1-va13sda'],
          '=',
        ),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.0', ['v1.2.1-vas1da'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.1', ['v1.2.1- va34sda'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.0', ['v1.2.1-vas3da'], '<='),
      )
    })
    it('should return false if string versions less than', () => {
      assert.strictEqual(true, segmentation.checkVersionFilter('1', ['2'], '<'))
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.2'], '<'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.1.1'], '<'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.', ['1.1.1'], '<'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.1', ['1.2.3'], '<'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['5'], '<'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4.9'], '<'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.242'], '<'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.241.5'], '<'),
      )
    })
    it('should return false if string versions less than', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter(null as unknown as string, ['1'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['1'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.1'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.1', ['1.1.1'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.', ['1.1'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('2', ['1'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2', ['1.1'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('2.1', ['1.1'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.1', ['1.2'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.', ['1.1'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.1', ['1.1.1'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.2', ['1.2'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.2', ['1.2.'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.2', ['1.2.1'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('4.8.241.2', ['4'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.241'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.241.0'], '<'),
      )
    })
    it('should return false if string versions less than or equal', () => {
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1', ['1'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.1'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.1', ['1.1.1'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.', ['1.1'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1', ['2'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.2'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.1.1'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.', ['1.1.1'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.1', ['1.2.3'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.241.2'], '<='),
      )
    })
    it('should return false if string versions less than or equal', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter(null as unknown as string, ['1'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('2', ['1'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2', ['1.1'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('2.1', ['1.1'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.1', ['1.2'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.', ['1.1'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.1', ['1.1.1'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.2', ['1.2'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.2', ['1.2.'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.2', ['1.2.1'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('4.8.241.2', ['4.8.241'], '<='),
      )
    })
    it('should return true if any numbers equal array', () => {
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1', ['1', '1.1'], '='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1', '1.1'], '='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.1', ''], '='),
      )
    })
    it('should return false if all numbers not equal array', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['2', '1.1'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.2', '1'], '='),
      )
    })
    it('should return true if any string versions equal array', () => {
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1', ['1', '1.1'], '='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.1', '1'], '='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.1', ['1.1.1', '1.1'], '='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.', ['1.1', '1.1'], '='),
      )
    })
    it('should return false if all string versions not equal array', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter(
          null as unknown as string,
          ['2', '3'],
          '=',
        ),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['2', '3'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.2', '1.2'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.1.1', '1.2'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.', ['1.1.1', '1.2'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.1', ['1.1', '1.1'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.1', ['1', '1.1.'], '='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.1', ['1.2.3', '1.'], '='),
      )
    })
    it('should return false if multiple versions do not equal the version', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['2', '1'], '!='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.2', '1.1'], '!='),
      )
    })
    it('should return true if multiple versions do not equal version', () => {
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.1.1', '1.2'], '!='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.', ['1.1.1', '1'], '!='),
      )
    })
    it('should return false if any string versions not greater than array', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['1', '1'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.1', '1.1.', '1.1'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['2'], '>'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.1.0'], '>'),
      )
    })
    it('should return true any if string versions greater than array', () => {
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('2', ['1', '2.0'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.1', ['1.2', '1.2'], '>'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.2.', ['1.1', '1.9.'], '>'),
      )
    })
    it('should return false if all string versions not greater than or equal array', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['2', '1.2'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.2'], '>='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1', ['1.1.1', '1.2'], '>='),
      )
    })
    it('should return true if any string versions greater than or equal array', () => {
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1', ['1', '1.1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.1', '1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.1', ['1.2', '1.1.1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.', ['1.1'], '>='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('2', ['1', '3'], '>='),
      )
    })
    it('should return true if any string versions less than array', () => {
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1', ['2', '1'], '<'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.2', '1.5'], '<'),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.', ['1.1.1'], '<'),
      )
    })
    it('should return false if all string versions less than array', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1', ['1', '1.0'], '<'),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.1.', ['1.1', '1.1.0'], '<'),
      )
    })
    it('should return true if any string versions less than or equal array', () => {
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1', ['1', '5'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1', ['1.1', '1.1.'], '<='),
      )
      assert.strictEqual(
        true,
        segmentation.checkVersionFilter('1.1.', ['1.1.1', '1.1.'], '<='),
      )
    })
    it('should return false if all string versions not less than or equal array', () => {
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('2', ['1', '1.9'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.1', ['1.2', '1.2'], '<='),
      )
      assert.strictEqual(
        false,
        segmentation.checkVersionFilter('1.2.', ['1.1', '1.1.9'], '<='),
      )
    })
  })

  // describe('checkLanguage', () => {
  //     it('should return true if no string or filters', () => {
  //         assert.strictEqual(true, segmentation.checkLanguage())
  //         assert.strictEqual(true, segmentation.checkLanguage(null, null))
  //     })
  //     it('should return false if filter and no value', () => {
  //         let filter = { type: 'sessionCount', comparator: '=', values: ['en', 'fr'] }
  //         assert.strictEqual(false, segmentation.checkLanguage(null, filter))
  //     })
  //     it('should return false if exists filter and no value', () => {
  //         let filter = { type: 'sessionCount', comparator: 'exist' }
  //         assert.strictEqual(false, segmentation.checkLanguage(null, filter))
  //         assert.strictEqual(false, segmentation.checkLanguage('', filter))
  //     })
  //     it('should return true if exists filter and value', () => {
  //         let filter = { type: 'sessionCount', comparator: 'exist' }
  //         assert.strictEqual(true, segmentation.checkLanguage('en', filter))
  //     })
  //     it('should return false if not exists filter and value', () => {
  //         let filter = { type: 'sessionCount', comparator: '!exist' }
  //         assert.strictEqual(false, segmentation.checkLanguage('en', filter))
  //     })
  //     it('should return false if contains filter and no value', () => {
  //         let filter = { type: 'sessionCount', comparator: 'contain', values: ['en'] }
  //         assert.strictEqual(false, segmentation.checkLanguage(null, filter))
  //     })
  //     it('should return true if contains filter and value contains', () => {
  //         let filter = { type: 'sessionCount', comparator: 'contain', values: ['en'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('en-CA', filter))
  //     })
  //     it('should return false if contains filter and value does not contain', () => {
  //         let filter = { type: 'sessionCount', comparator: 'contain', values: ['en'] }
  //         assert.strictEqual(false, segmentation.checkLanguage('fr', filter))
  //     })
  //     it('should return true if not contains filter and value', () => {
  //         let filter = { type: 'sessionCount', comparator: '!contain', values: ['en'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('fr', filter))
  //     })
  //     it('should return false if not contains filter and not value', () => {
  //         let filter = { type: 'sessionCount', comparator: '!contain', values: ['en'] }
  //         assert.strictEqual(false, segmentation.checkLanguage('en', filter))
  //     })
  //     it('should return true if no filter', () => {
  //         assert.strictEqual(true, segmentation.checkLanguage('en'))
  //         assert.strictEqual(true, segmentation.checkLanguage('en', null))
  //     })
  //     it('should return false if string is not a string', () => {
  //         assert.strictEqual(false, segmentation.checkLanguage(1, []))
  //     })
  //     it('should return false if filter value is not a string', () => {
  //         let filter = { type: 'sessionCount', comparator: '=', values: [1, 2] }
  //         assert.strictEqual(false, segmentation.checkLanguage('en', filter))
  //     })
  //     it('should return true if string is equal', () => {
  //         let filter = { type: 'sessionCount', comparator: '=', values: ['en'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('en', filter))
  //         assert.strictEqual(true, segmentation.checkLanguage('en-CA', filter))
  //     })
  //     it('should return false if string is not equal', () => {
  //         let filter = { type: 'sessionCount', comparator: '=', values: ['en'] }
  //         assert.strictEqual(false, segmentation.checkLanguage('fr', filter))
  //     })
  //     it('should return true if string is one of multiple values', () => {
  //         let filter = { type: 'platform', comparator: '=', values: ['en', 'fr'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('fr', filter))
  //         assert.strictEqual(true, segmentation.checkLanguage('fr-CA', filter))
  //     })
  //     it('should return true if string is equal to multiple filters', () => {
  //         let filters = [
  //             { type: 'last_app_lang', comparator: '=', values: ['en'] },
  //             { type: 'last_app_lang', comparator: '!=', values: ['fr'] }
  //         ]
  //         assert.strictEqual(true, segmentation.checkLanguage('en', filters))
  //     })
  //     it('should return false for conflicting lang filters', () => {
  //         let filters = [
  //             { type: 'last_app_lang', comparator: '=', values: ['en'] },
  //             { type: 'last_app_lang', comparator: '!=', values: ['en'] }
  //         ]
  //         assert.strictEqual(false, segmentation.checkLanguage('en', filters))
  //     })
  //     it('should return false for conflicting lang filters with iOS style lang', () => {
  //         let filters = [
  //             { type: 'last_app_lang', comparator: '=', values: ['en'] },
  //             { type: 'last_app_lang', comparator: '!=', values: ['en'] }
  //         ]
  //         assert.strictEqual(false, segmentation.checkLanguage('en-CA', filters))
  //     })
  //     it('should return false if string is not equal to multiple filters', () => {
  //         let filters = [
  //             { type: 'appLanguage', comparator: '=', values: ['en'] },
  //             { type: 'appLanguage', comparator: '=', values: ['fr'] }
  //         ]
  //         assert.strictEqual(false, segmentation.checkLanguage('en', filters))
  //     })
  //     it('should return true if satisfies value in filter', () => {
  //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hant'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfasdf-hant', filter))
  //     })
  //     it('should return true if satisfies value in filter', () => {
  //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hant*'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfasdf-hant-HK', filter))
  //     })
  //     it('should return true if satisfies value in filter', () => {
  //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hant*'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfasdf-hant-HK', filter))
  //     })
  //     it('should return true if satisfies value in the filter', () => {
  //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hans*'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfasdf-hans-TW', filter))
  //     })
  //     it('should return true if satisfies one of the values in the filter', () => {
  //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*HK'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfsd-HK', filter))
  //     })
  //     it('should return true if satisfies value in filter', () => {
  //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*HK'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfsd-HK', filter))
  //     })
  //     it('should return true if satisifies one of the values in the filter', () => {
  //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hans', 'zh*HK'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfsd-HK', filter))
  //     })
  //     it('should return true if does not satisfy one of the values in the filter', () => {
  //         let filter = { type: 'last_app_lang', comparator: '!=', values: ['zh*hans', 'zh*HK'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfsd-HK', filter))
  //     })
  //     it('should return true if does not satisfy any of the values in the filter', () => {
  //         let filter = { type: 'last_app_lang', comparator: '!=', values: ['zh*hans', 'zh*HK'] }
  //         assert.strictEqual(true, segmentation.checkLanguage('zh-hant', filter))
  //     })
  //     it('should return false if filter not satisfied', () => {
  //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hans'] }
  //         assert.strictEqual(false, segmentation.checkLanguage('zh-hant', filter))
  //     })
  //     it('should return false if not all filters are satisfied', () => {
  //         let filters = [
  //             { type: 'last_app_lang', comparator: '=', values: ['zh*hant'] },
  //             { type: 'last_app_lang', comparator: '=', values: ['zh*hans'] }
  //         ]
  //         assert.strictEqual(false, segmentation.checkLanguage('zh-hant', filters))
  //     })
  //     it('should return true if all filters are satisfied', () => {
  //         let filters = [
  //             { type: 'last_app_lang', comparator: '=', values: ['zh*hant'] },
  //             { type: 'last_app_lang', comparator: '!=', values: ['zh*hans'] }
  //         ]
  //         assert.strictEqual(true, segmentation.checkLanguage('zh-hant', filters))
  //     })
  // })

  describe('checkCustomData', () => {
    const filterStr = {
      comparator: '=',
      dataKey: 'strKey',
      dataKeyType: 'String',
      type: 'user',
      subType: 'customData',
      values: ['value'],
      filters: [],
    } as AudienceFilterOrOperator
    it('should return false if filter and no data', () => {
      const data = null as unknown as Record<string, unknown>
      assert.strictEqual(false, segmentation.checkCustomData(data, filterStr))
    })
    it('should return true if string value is equal', () => {
      assert.strictEqual(
        true,
        segmentation.checkCustomData({ strKey: 'value' }, filterStr),
      )
    })
    it('should return true if string is one OR value', () => {
      const filter = clone(filterStr)
      filter.values = ['value', 'value too']
      assert.strictEqual(
        true,
        segmentation.checkCustomData({ strKey: 'value' }, filter),
      )
    })
    it('should return false if string value is not equal', () => {
      assert.strictEqual(
        false,
        segmentation.checkCustomData({ strKey: 'not value' }, filterStr),
      )
    })

    it('should return false if string value isnt present', () => {
      assert.strictEqual(false, segmentation.checkCustomData({}, filterStr))
    })
    it('should return true if string is not equal to multiple values', () => {
      const filter = {
        ...filterStr,
        comparator: FilterComparator['!='],
        values: ['value1', 'value2', 'value3'],
      }
      assert.strictEqual(
        true,
        segmentation.checkCustomData({ strKey: 'value' }, filter),
      )
    })
    it('should return false if string is not equal to multiple values', () => {
      const filter = {
        ...filterStr,
        comparator: FilterComparator['!='],
        values: ['value1', 'value2', 'value3'],
      }
      assert.strictEqual(
        false,
        segmentation.checkCustomData({ strKey: 'value2' }, filter),
      )
    })

    const filterNum = clone(filterStr)
    filterNum.dataKey = 'numKey'
    filterNum.values = [0]
    it('should return true if number value is equal', () => {
      assert.strictEqual(
        true,
        segmentation.checkCustomData({ numKey: 0 }, filterNum),
      )
    })
    it('should return true if number is one OR value', () => {
      const filter = clone(filterNum)
      filter.values = [0, 1]
      assert.strictEqual(
        true,
        segmentation.checkCustomData({ numKey: 1 }, filter),
      )
    })
    it('should return false if number value is not equal', () => {
      assert.strictEqual(
        false,
        segmentation.checkCustomData({ numKey: 1 }, filterNum),
      )
    })

    const filterBool = clone(filterStr)
    filterBool.dataKey = 'boolKey'
    filterBool.values = [false]
    it('should return true if bool value is equal', () => {
      assert.strictEqual(
        true,
        segmentation.checkCustomData({ boolKey: false }, filterBool),
      )
    })
    it('should return false if bool value is not equal', () => {
      assert.strictEqual(
        false,
        segmentation.checkCustomData({ boolKey: true }, filterBool),
      )
    })
    it('should return true if all filters are equal', () => {
      const operatorFilter = {
        filters: [filterStr, filterNum, filterBool],
        operator: 'and',
      } as unknown as TopLevelOperator
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data: { customData: { strKey: 'value', numKey: 0, boolKey: false } },
          operator: operatorFilter,
          featureId,
          isOptInEnabled,
        }),
      )
    })
    it('should return false if one custom data key is missing', () => {
      const operatorFilter = {
        filters: [filterStr, filterNum, filterBool],
        operator: 'and',
      } as unknown as TopLevelOperator
      assert.strictEqual(
        false,
        segmentation.evaluateOperator({
          data: { customData: { strKey: 'value', boolKey: false } },
          operator: operatorFilter,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should return true if one custom data key is missing with not equal filter value', () => {
      const filter = clone(filterNum)
      filter.comparator = '!=' as FilterComparator
      const operatorFilter = {
        filters: [filterStr, filter, filterBool],
        operator: 'and',
      } as unknown as TopLevelOperator
      assert.strictEqual(
        true,
        segmentation.evaluateOperator({
          data: { customData: { strKey: 'value', boolKey: false } },
          operator: operatorFilter,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should return true if no custom data is provided with not equal filter value', () => {
      const filter = clone(filterNum)
      filter.comparator = '!=' as FilterComparator
      const data = null as unknown as Record<string, unknown>
      assert.strictEqual(true, segmentation.checkCustomData(data, filter))
    })

    it('should return true if no custom data is provided with not exists filter value', () => {
      const filter = clone(filterNum)
      filter.comparator = '!exist' as FilterComparator

      const data = null as unknown as Record<string, unknown>
      assert.strictEqual(true, segmentation.checkCustomData(data, filter))
    })

    it('should return false if no custom data is provided with not equal filter and others', () => {
      const filter = clone(filterNum)
      filter.comparator = '!=' as FilterComparator
      const operatorFilter = {
        filters: [filterStr, filter, filterBool],
        operator: 'and',
      } as unknown as TopLevelOperator
      assert.strictEqual(
        false,
        segmentation.evaluateOperator({
          data: { customData: null },
          operator: operatorFilter,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    it('should return false if no custom data is provided with not exists filter and others', () => {
      const filter = clone(filterNum)
      filter.comparator = '!exist' as FilterComparator
      const operatorFilter = {
        filters: [filterStr, filter, filterBool],
        operator: 'and',
      } as unknown as TopLevelOperator
      assert.strictEqual(
        false,
        segmentation.evaluateOperator({
          data: { customData: null },
          operator: operatorFilter,
          featureId,
          isOptInEnabled,
        }),
      )
    })

    const containsFilter = {
      comparator: 'contain',
      type: 'user',
      subType: 'customData',
      dataKey: 'last_order_no',
      values: ['FP'],
    } as AudienceFilterOrOperator
    it('should return true if custom data contains value', () => {
      assert.strictEqual(
        true,
        segmentation.checkCustomData(
          { last_order_no: 'FP2423423' },
          containsFilter,
        ),
      )
    })

    const existsFilter = {
      comparator: 'exist',
      type: 'user',
      subType: 'customData',
      dataKey: 'field',
      values: [],
    } as AudienceFilterOrOperator
    it('should return true if custom data value exists', () => {
      assert.strictEqual(
        true,
        segmentation.checkCustomData({ field: 'something' }, existsFilter),
      )
    })

    it('should return false if custom data value does not exist', () => {
      assert.strictEqual(
        false,
        segmentation.checkCustomData({ not_field: 'something' }, existsFilter),
      )
    })
  })

  describe('parseUserAgent', () => {
    describe('Desktop User Agents', () => {
      const outputChrome = { browser: 'Chrome', browserDeviceType: 'Desktop' }
      const outputFirefox = { browser: 'Firefox', browserDeviceType: 'Desktop' }
      const outputSafari = { browser: 'Safari', browserDeviceType: 'Desktop' }
      const outputOther = { browser: 'Other', browserDeviceType: 'Desktop' }

      it('should recognize a Chrome Desktop user agent', () => {
        const chromeDesktopUA =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36'

        expect(segmentation.parseUserAgent(chromeDesktopUA)).toEqual(
          outputChrome,
        )
      })

      it('should recognize a Firefox Desktop user agent', () => {
        const firefoxDesktopUA =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:77.0) ' +
          'Gecko/20100101 Firefox/77.0'

        expect(segmentation.parseUserAgent(firefoxDesktopUA)).toEqual(
          outputFirefox,
        )
      })

      it('should recognize a Safari Desktop user agent', () => {
        const safariDesktopUA =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 ' +
          '(KHTML, like Gecko) Version/13.1.2 Safari/605.1.15'

        expect(segmentation.parseUserAgent(safariDesktopUA)).toEqual(
          outputSafari,
        )
      })

      it('should recognize a Chromium Desktop user agent', () => {
        const chromiumDesktopUA =
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) ' +
          'Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30'

        expect(segmentation.parseUserAgent(chromiumDesktopUA)).toEqual(
          outputChrome,
        )
      })

      it('should recognize a Headless Chrome Desktop user agent', () => {
        const chromeHeadlessDesktopUA =
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) HeadlessChrome/63.0.3205.0 Safari/537.36'

        expect(segmentation.parseUserAgent(chromeHeadlessDesktopUA)).toEqual(
          outputChrome,
        )
      })

      it('should default the user agent as Other Desktop', () => {
        const postmanUA = 'PostmanRuntime/7.26.1'

        expect(segmentation.parseUserAgent(postmanUA)).toEqual(outputOther)
      })
    })

    describe('Mobile User Agents (iOS)', () => {
      const outputChrome = { browser: 'Chrome', browserDeviceType: 'Mobile' }
      const outputFirefox = { browser: 'Firefox', browserDeviceType: 'Mobile' }
      const outputSafari = { browser: 'Safari', browserDeviceType: 'Mobile' }

      it('should recognize a Chrome Mobile user agent', () => {
        const chromeMobileUA =
          'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 ' +
          '(KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1'

        expect(segmentation.parseUserAgent(chromeMobileUA)).toEqual(
          outputChrome,
        )
      })

      it('should recognize a Firefox Mobile user agent', () => {
        const firefoxMobileUA =
          'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) ' +
          'AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/11.0b9935 Mobile/15E216 Safari/605.1.15'

        expect(segmentation.parseUserAgent(firefoxMobileUA)).toEqual(
          outputFirefox,
        )
      })

      it('should recognize a Safari Mobile user agent', () => {
        const safariMobileUA =
          'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X)' +
          ' AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1'

        expect(segmentation.parseUserAgent(safariMobileUA)).toEqual(
          outputSafari,
        )
      })
    })

    describe('Mobile User Agents (Android)', () => {
      const outputChrome = { browser: 'Chrome', browserDeviceType: 'Mobile' }
      const outputFirefox = { browser: 'Firefox', browserDeviceType: 'Mobile' }

      it('should recognize a Chrome Mobile user agent', () => {
        const chromeMobileUA =
          'Mozilla/5.0 (Linux; Android 10; SM-G975W) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.111 Mobile Safari/537.36'

        expect(segmentation.parseUserAgent(chromeMobileUA)).toEqual(
          outputChrome,
        )
      })

      it('should recognize a Firefox Mobile user agent', () => {
        const firefoxMobileUA =
          'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0'

        expect(segmentation.parseUserAgent(firefoxMobileUA)).toEqual(
          outputFirefox,
        )
      })
    })

    describe('Tablet User Agents (iOS)', () => {
      const outputChrome = { browser: 'Chrome', browserDeviceType: 'Tablet' }
      const outputFirefox = { browser: 'Firefox', browserDeviceType: 'Tablet' }
      const outputSafari = { browser: 'Safari', browserDeviceType: 'Tablet' }

      it('should recognize a Chrome Tablet user agent', () => {
        const chromeTabletUA =
          'Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X) ' +
          'AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/71.0.3578.77 Mobile/15E148 Safari/605.1'

        expect(segmentation.parseUserAgent(chromeTabletUA)).toEqual(
          outputChrome,
        )
      })

      it('should recognize a Firefox Tablet user agent', () => {
        const firefoxTabletUA =
          'Mozilla/5.0 (iPad; CPU OS 10_2_1 like Mac OS X) ' +
          'AppleWebKit/602.4.6 (KHTML, like Gecko) FxiOS/6.0 Mobile/14D27 Safari/602.4.6'

        expect(segmentation.parseUserAgent(firefoxTabletUA)).toEqual(
          outputFirefox,
        )
      })

      it('should recognize a Safari Tablet user agent', () => {
        const safariTabletUA =
          'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) ' +
          'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1'

        expect(segmentation.parseUserAgent(safariTabletUA)).toEqual(
          outputSafari,
        )
      })
    })

    describe('Tablet User Agents (Android)', () => {
      const outputChrome = { browser: 'Chrome', browserDeviceType: 'Tablet' }
      const outputFirefox = { browser: 'Firefox', browserDeviceType: 'Tablet' }

      it('should recognize a Chrome Tablet user agent', () => {
        const chromeTabletUA =
          'Mozilla/5.0 (Linux; Android 7.0; Pixel C Build/NRD90M; wv)' +
          ' AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.98 Safari/537.36'

        expect(segmentation.parseUserAgent(chromeTabletUA)).toEqual(
          outputChrome,
        )
      })

      it('should recognize a Firefox Tablet user agent', () => {
        const firefoxTabletUA =
          'Mozilla/5.0 (Android 8.1.0; Tablet; rv:68.0) Gecko/68.0 Firefox/68.0'

        expect(segmentation.parseUserAgent(firefoxTabletUA)).toEqual(
          outputFirefox,
        )
      })
    })
  })

  describe('parseUserAgent - Handle invalid input', () => {
    it('should return undefined properties when the user agent is undefined', () => {
      expect(segmentation.parseUserAgent(undefined)).toEqual({
        browser: undefined,
        browserDeviceType: undefined,
      })
    })

    it('should return undefined properties when the user agent is empty', () => {
      expect(segmentation.parseUserAgent('')).toEqual({
        browser: undefined,
        browserDeviceType: undefined,
      })
    })

    it('should return an Other Desktop segmentation when the user agent is unknown', () => {
      expect(segmentation.parseUserAgent('not a real user agent')).toEqual({
        browser: 'Other',
        browserDeviceType: 'Desktop',
      })
    })
  })

  describe('filterAudiencesFromSubtypes', () => {
    const audiences = [
      {
        _id: '60cca1d8230f17002542b909',
        filters: {
          filters: [
            {
              values: ['Android', 'Fire TV', 'Android TV'],
              comparator: '=',
              subType: 'platform',
              type: 'user',
            },
          ],
          operator: 'and',
        },
      },
      {
        _id: '60cca1d8230f17002542b910',
        filters: {
          filters: [
            {
              values: ['Fire TV', 'Android TV'],
              comparator: '=',
              subType: 'platform',
              type: 'user',
            },
          ],
          operator: 'and',
        },
      },
      {
        _id: '60cca1d8230f17002542b911',
        filters: {
          filters: [
            {
              values: ['Android TV'],
              comparator: '=',
              subType: 'platform',
              type: 'user',
            },
          ],
          operator: 'and',
        },
      },
      {
        _id: '60cca1d8230f17002542b912',
        filters: {
          filters: [
            {
              values: ['Android'],
              comparator: '=',
              subType: 'platform',
              type: 'user',
            },
          ],
          operator: 'and',
        },
      },
      {
        _id: '60cca1d8230f17002542b913',
        filters: {
          filters: [
            {
              values: ['iOS'],
              comparator: '=',
              subType: 'platform',
              type: 'user',
            },
          ],
          operator: 'and',
        },
      },
    ] as unknown as Audience[]
    it('should filter all Android TV audiences properly if it is included in data', () => {
      const data = {
        platform: 'Android TV',
      }
      const filteredAudiences = audiences.filter((aud) => {
        return segmentation.evaluateOperator({
          operator: aud.filters,
          data,
          featureId,
          isOptInEnabled,
        })
      })
      expect(filteredAudiences.length).toEqual(3)
      expect(filteredAudiences[0]._id).toEqual('60cca1d8230f17002542b909')
      expect(filteredAudiences[1]._id).toEqual('60cca1d8230f17002542b910')
      expect(filteredAudiences[2]._id).toEqual('60cca1d8230f17002542b911')
    })
    it('should filter experiment with iOS properly', () => {
      const data = {
        platform: 'iOS',
      }
      const filteredAudiences = audiences.filter((aud) => {
        return segmentation.evaluateOperator({
          operator: aud.filters,
          data,
          featureId,
          isOptInEnabled,
        })
      })
      expect(filteredAudiences.length).toEqual(1)
      expect(filteredAudiences[0]._id).toEqual('60cca1d8230f17002542b913')
    })
  })
})
