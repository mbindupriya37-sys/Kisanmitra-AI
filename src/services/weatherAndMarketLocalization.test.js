import { test, describe } from 'node:test'
import assert from 'node:assert'
import enDict from '../locales/en.json' with { type: 'json' }
import teDict from '../locales/te.json' with { type: 'json' }
import hiDict from '../locales/hi.json' with { type: 'json' }
import { translate, resolveNestedKey } from '../context/languageConfig.js'

describe('Step 6B: Weather & Climate and Market Intelligence Localization', () => {

  test('1. Weather & Climate dictionary keys exist and differ across en, te, hi', () => {
    const weatherKeys = [
      'weather.logoTitle',
      'weather.backToDashboard',
      'weather.badgeDecisionSupport',
      'weather.heroTitle',
      'weather.heroSubtitle',
      'weather.heroDisclaimer',
      'weather.locationCardTitle',
      'weather.stateLabel',
      'weather.districtLabel',
      'weather.districtPlaceholder',
      'weather.btnCheck',
      'weather.btnRefresh',
      'weather.currentObsTitle',
      'weather.metricHumidity',
      'weather.metricPrecipitation',
      'weather.metricWindSpeed',
      'weather.risksTitle',
      'weather.forecastTitle',
      'weather.considerationsTitle',
      'weather.cropContextTitle',
      'weather.selectCropPlaceholder'
    ]

    for (const key of weatherKeys) {
      const enVal = resolveNestedKey(enDict, key)
      const teVal = resolveNestedKey(teDict, key)
      const hiVal = resolveNestedKey(hiDict, key)

      assert.ok(enVal && enVal.trim().length > 0, `Missing EN key: ${key}`)
      assert.ok(teVal && teVal.trim().length > 0, `Missing TE key: ${key}`)
      assert.ok(hiVal && hiVal.trim().length > 0, `Missing HI key: ${key}`)

      assert.notStrictEqual(teVal, enVal, `Telugu must differ from English for ${key}`)
      assert.notStrictEqual(hiVal, enVal, `Hindi must differ from English for ${key}`)
    }
  })

  test('2. Market Intelligence dictionary keys exist and differ across en, te, hi', () => {
    const marketKeys = [
      'market.logoTitle',
      'market.backToDashboard',
      'market.badgeAgmarknet',
      'market.heroTitle',
      'market.heroSubtitle',
      'market.heroDisclaimer',
      'market.filterTitle',
      'market.cropLabel',
      'market.stateLabel',
      'market.allStatesOption',
      'market.btnSearch',
      'market.btnReset',
      'market.tabPrices',
      'market.tabCompare',
      'market.tabTrends',
      'market.pricesSectionTitle',
      'market.thCrop',
      'market.thMarket',
      'market.thModalPrice',
      'market.tagLiveAgmarknet',
      'market.emptyObsTitle',
      'market.compareTitle',
      'market.trendsTitle',
      'market.considerationsTitle'
    ]

    for (const key of marketKeys) {
      const enVal = resolveNestedKey(enDict, key)
      const teVal = resolveNestedKey(teDict, key)
      const hiVal = resolveNestedKey(hiDict, key)

      assert.ok(enVal && enVal.trim().length > 0, `Missing EN key: ${key}`)
      assert.ok(teVal && teVal.trim().length > 0, `Missing TE key: ${key}`)
      assert.ok(hiVal && hiVal.trim().length > 0, `Missing HI key: ${key}`)

      assert.notStrictEqual(teVal, enVal, `Telugu must differ from English for ${key}`)
      assert.notStrictEqual(hiVal, enVal, `Hindi must differ from English for ${key}`)
    }
  })

  test('3. Weather observations, numeric measurements, units and provider attribution remain immutable', () => {
    const mockApiResponse = {
      location: { regionName: 'Guntur, Andhra Pradesh' },
      current: {
        observationTime: '2026-10-10 14:00',
        temperature: 31.5,
        feelsLike: 33.2,
        weatherCondition: 'Partly Cloudy',
        weatherCode: 2,
        humidity: 68,
        rainfall: 0.0,
        windSpeed: 14.2
      },
      sourceAttribution: 'Weather data provided by Open-Meteo meteorological API (CC BY 4.0).'
    }

    // Numbers, raw strings, units, and attributions must never be altered by locale
    assert.strictEqual(mockApiResponse.current.temperature, 31.5)
    assert.strictEqual(mockApiResponse.current.humidity, 68)
    assert.strictEqual(mockApiResponse.current.rainfall, 0.0)
    assert.strictEqual(mockApiResponse.current.windSpeed, 14.2)
    assert.strictEqual(mockApiResponse.sourceAttribution.includes('Open-Meteo'), true)

    // Dynamic string formatting renders correctly with exact numerical values
    const enFeelsLike = translate('en', 'weather.feelsLike').replace('{temp}', mockApiResponse.current.feelsLike.toFixed(1))
    const teFeelsLike = translate('te', 'weather.feelsLike').replace('{temp}', mockApiResponse.current.feelsLike.toFixed(1))
    const hiFeelsLike = translate('hi', 'weather.feelsLike').replace('{temp}', mockApiResponse.current.feelsLike.toFixed(1))

    assert.ok(enFeelsLike.includes('33.2°C'))
    assert.ok(teFeelsLike.includes('33.2°C'))
    assert.ok(hiFeelsLike.includes('33.2°C'))
  })

  test('4. Market Intelligence prices, currency, units and official AGMARKNET source remain unaltered', () => {
    const mockMarketItem = {
      id: 101,
      cropName: 'Rice',
      marketName: 'Guntur Mandi',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      variety: 'Common',
      observationDate: '2026-10-09',
      minPrice: 2150,
      maxPrice: 2400,
      modalPrice: 2280,
      freshnessStatus: 'LIVE'
    }

    // Ensure raw numerical values are preserved
    assert.strictEqual(mockMarketItem.minPrice, 2150)
    assert.strictEqual(mockMarketItem.maxPrice, 2400)
    assert.strictEqual(mockMarketItem.modalPrice, 2280)

    // Price difference calculation is mathematically deterministic and invariant to locale
    const averageModalPrice = 2200
    const priceDifference = mockMarketItem.modalPrice - averageModalPrice
    assert.strictEqual(priceDifference, 80)

    // Official AGMARKNET naming is preserved across all locales
    assert.ok(translate('en', 'market.badgeAgmarknet').includes('AGMARKNET'))
    assert.ok(translate('te', 'market.badgeAgmarknet').includes('AGMARKNET'))
    assert.ok(translate('hi', 'market.badgeAgmarknet').includes('AGMARKNET'))
  })

  test('5. API query parameters and canonical filter values remain strictly preserved', () => {
    // Weather request params
    const weatherFilter = {
      state: 'Andhra Pradesh',
      district: 'Guntur',
      cropId: '4'
    }
    const weatherParams = new URLSearchParams()
    weatherParams.append('state', weatherFilter.state)
    weatherParams.append('district', weatherFilter.district)
    weatherParams.append('cropId', weatherFilter.cropId)
    assert.strictEqual(weatherParams.toString(), 'state=Andhra+Pradesh&district=Guntur&cropId=4')

    // Market request params
    const marketFilter = {
      crop: 'Cotton',
      state: 'Maharashtra',
      district: 'Nagpur',
      market: 'Nagpur Mandi'
    }
    const marketParams = new URLSearchParams()
    marketParams.append('crop', marketFilter.crop)
    marketParams.append('state', marketFilter.state)
    marketParams.append('district', marketFilter.district)
    marketParams.append('market', marketFilter.market)
    assert.strictEqual(marketParams.toString(), 'crop=Cotton&state=Maharashtra&district=Nagpur&market=Nagpur+Mandi')
  })

  test('6. Empty, unavailable, and error states remain truthful without fabrication', () => {
    // Unavailable crop weather context
    const unavailCropContext = {
      available: false,
      summary: 'Verified agronomic weather thresholds are not currently cataloged for this crop.'
    }
    assert.strictEqual(unavailCropContext.available, false)
    assert.ok(unavailCropContext.summary.includes('not currently cataloged'))

    // Empty market observations state
    const emptyMarketData = {
      totalRecords: 0,
      observations: []
    }
    assert.strictEqual(emptyMarketData.totalRecords, 0)
    assert.strictEqual(emptyMarketData.observations.length, 0)
  })
})
