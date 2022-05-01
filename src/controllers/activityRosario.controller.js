const fetch = require("node-fetch");
const Activity = require('../models/activity')
const Comment = require('../models/comment')
const path = require('path')
const serviceActRos = require('../services/activitiesRosario')
const helpers = require('../server/helpers')
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

/* ************************************************************** ACTIVIDADES DE LA MUNICIPALIDAD ************************************************************** */

async function renderActivitiesRosario(req, res) {

  var tmp = {}
  // Muestra de a 20 por Pagina
  const range = 20
  let activities = []
  let today = helpers.today()
  let todayPlus7 = helpers.datePlus7(today)

  // POST Si hace algun filtro agarra el req.body
  let { dateFrom = today, dateTo = todayPlus7, tag = 'Todas', place = 'Todos' } = req.body
  // GET Si cambia de pagina agarra el req.params
  let { page } = req.params

  //console.log(helpers.formatDatePicker(dateFrom), " ", helpers.formatDatePicker(dateTo), " ", tag, place)

  // ************** HASTA eL 27/05/2021 ESTOS SON TODOS LOS TAGS QUE HAY EN LAS ACTIVIDADES ************** //
  //await serviceActRos.checkTags()
  tagsRender = await serviceActRos.allTags(tag)
  districtsRender = await serviceActRos.allDistricts(place)

  // Si cambio de pagina trae los filtros de localSorage
  if (page) {
    tmp = JSON.parse(localStorage.getItem('tmpReqBody'));
    console.log(tmp)
    dateFrom = tmp.dateFrom
    dateTo = tmp.dateTo
    tag = tmp.tag
    place = tmp.place
  }
  // Si metio algun fitro guarda los filtros en localSorage
  else {
    page = 1
    localStorage.setItem('tmpReqBody', JSON.stringify({ dateFrom, dateTo, tag, place }));
  }

  console.log(dateFrom, " ", dateTo, " ", tag, place)

  //if (Object.entries(req.body).length === 0) {console.log("No hay request body")}
  //if (JSON.stringify(req.body) === JSON.stringify(tmp)) { console.log("Son iguales") }

  // SI SE BUSCA SOLO POR FECHA, SE BUSCA PRIMERO LAS OCURRENCIA QUE ESTEN EN ESE RANGO DE FECHA
  // Crea un objeto que lleva los datos minimos para renderizarlos en pantalla

  if (tag == 'Todas') {
    const URI = `https://ws.rosario.gob.ar/web/api/v1.0`
    let URI_Ocurr = URI + `/ocurrencias?`

    // Si no hay dateFrom, le pone la fecha de hoy si o si
    // if (!dateFrom) {
    //   URI_Ocurr += `filter[dateFull][value][0]=${today}&filter[dateFull][operator][0]=">="`
    // }
    // Si hay dateFrom y dateTo, filtra por esas fechas
    if (dateFrom) {
      URI_Ocurr += `filter[dateFull][value][0]=${dateFrom}&filter[dateFull][operator][0]=">="`

      if (dateTo) {
        URI_Ocurr += `&filter[dateFull][value][1]=${helpers.datePlus1(dateTo)}&filter[dateFull][operator][1]="<="`
      }
    }

    if (place && place != 'Todos') {
      URI_Ocurr += `&filter[eventual_distrito]=${place}`
    }

    URI_Ocurr += `&sort=dateFull&range=${range}`

    console.log("Pagina ", page)

    URI_Ocurr += `&page=${page}`

    // Hace la consulta a la API
    const ocurr = await fetch(URI_Ocurr)
    const occurences = await ocurr.json()

    // Define la cantidad de paginas que va a haber
    const cantPages = Math.ceil(occurences.meta.count / range)
    let pages = await serviceActRos.calculatePages(cantPages, page)

    pages = pages.map(page => ({ n: page }))
    //Hay que agregar si o si un atributo con la pagina actual, 
    //sino en la iteracion de handlebars no te deja preguntar por alguna variable externa al objeto iterado
    pages.forEach(element => {
      element.page = page
    });

    //BUSCO LAS ACTIVIDADES DE ESAS OCURRENCIAS ORDENADAS POR FECHA DE OCURRENCIA
    activitiesRender = await serviceActRos.searchActivities(activities, occurences, tag)

    console.log("***************************** RENDER FINAL ********************************************")

    res.render('activities-rosario/all-activities-rosario', { activitiesRender, tagsRender, districtsRender, dateFrom, dateTo, page, pages, cantPages })
  }


  // Busqueda con Tag
  else {
    let occurences = []

    let URI_Act = `https://ws.rosario.gob.ar/web/api/v1.1/actividades?include=ocurrencias`
    const aot = await fetch(URI_Act + `&filter[tags.id]=${tag}`)
    const actOccurTag = await aot.json()

    if (actOccurTag.meta.count <= 50) { occurences = actOccurTag.included }
    else {

      if (actOccurTag.included) {
        occurences = [...occurences, ...actOccurTag.included];
      }

      for (i = 2; i <= Math.ceil(actOccurTag.meta.count / 50); i++) {

        const aot = await fetch(URI_Act + `&filter[tags.id]=${tag}&page=${i}`)
        const actOccurTag = await aot.json()

        if (actOccurTag.included) {
          occurences = [...occurences, ...actOccurTag.included];
        }
      }
    }

    occurences.sort((a, b) => {
      return new Date(a.attributes.date_start) - new Date(b.attributes.date_start);
    });

    // if (!dateFrom) {
    //   occurences = occurences.filter(o => o.attributes.date_start >= today)
    // }
    if (dateFrom) {
      occurences = occurences.filter(o => o.attributes.date_start >= dateFrom)
      if (dateTo) {
        occurences = occurences.filter(o => o.attributes.date_start <= dateTo)
      }
    }
    if (place && place != 'Todas') {
      occurences = occurences.filter(o => o.attributes.eventual_distrito == place)
    }

    // Cuento cuantas ocurrencias hay con esos filtros
    let cantOccurFiltered = 0
    for (let o in occurences) { cantOccurFiltered += 1 }

    const cantPages = Math.ceil(cantOccurFiltered / range)
    let pages = await serviceActRos.calculatePages(cantPages, page)
    pages = pages.map(page => ({ n: page }))
    //Hay que agregar si o si un atributo con la pagina actual, sino en la iteracion de handlebars no te deja preguntar por alguna variable externa al objeto iterado
    pages.forEach(element => {
      element.page = page
    });

    let subOccur = []

    if (page == 1) {
      subOccur = occurences.slice(0, 20)
    }
    else {
      subOccur = occurences.slice(20 * (page - 1), 20 * page)
    }

    activitiesRender = await serviceActRos.searchActivities(activities, subOccur, tag)

    res.render('activities-rosario/all-activities-rosario', { activitiesRender, tagsRender, districtsRender, dateFrom, dateTo, page, pages, cantPages })
  }

}

async function renderActivityRosario(req, res) {

  // Por ahora va con la fecha de hoy pero deberia ser la fecha de la actividad
  const today = helpers.today()

  let { actID, occurID } = req.query

  console.log(req.query)

  let URI_Act = `https://ws.rosario.gob.ar/web/api/v1.1/actividades?include=ocurrencias`
  const URI_Rule = `https://ws.rosario.gob.ar/web/api/v1.0/reglas?`

  const a = await fetch(URI_Act + `&filter[id]=${actID}`)
  const act = await a.json()

  let rule
  let actualOccur
  let actualOccurence

  const activity = act.data[0]

  let occurences = act.included

  // Si la actividad tiene ocurrencias en el Included, busca las ocuurencias que siguen y su regla
  if (occurences) {

    for (let o in occurences) { occurences[o].image = activity.attributes.images[0].styles.medium }
    rule = await fetch(URI_Rule + `filter[id]=${occurences[0].attributes.regla}`)
    rule = await rule.json()
    rule = rule.data[0]

    occurences = occurences.filter(o => o.attributes.date_start >= today)

    // Ordena de menor a mayor
    occurences.sort((a, b) => {
      return new Date(a.attributes.date_start) - new Date(b.attributes.date_start);
    });

    actualOccur = occurences.filter(o => o.attributes.id == occurID)
    actualOccurence = actualOccur[0]

    console.log("Busque la ocurrencia en el included")
    console.log(actualOccurence)

    if (actualOccurence) {
      console.log("Hay included y tiene esa ocurrencia")
    }
    else {
      console.log("Hay included pero no tiene esa ocurrencia")
      console.log("Busque la ocurrencia con un fetch por ID")
      occurences = await fetch(`https://ws.rosario.gob.ar/web/api/v1.0/ocurrencias?filter[id]=${occurID}`)
      actualOccur = await occurences.json()
      actualOccurence = actualOccur.data[0]

      console.log(actualOccurence)

      rule = await fetch(URI_Rule + `filter[id]=${actualOccurence.attributes.regla}`)
      rule = await rule.json()
      rule = rule.data[0]
    }
  }
  else {
    console.log("Busque la ocurrencia con un fetch por ID")
    occurences = await fetch(`https://ws.rosario.gob.ar/web/api/v1.0/ocurrencias?filter[id]=${occurID}`)
    occurences = await occurences.json()
    actualOccur = occurences
    actualOccurence = actualOccur.data[0]
    
    occurences = []
    console.log(actualOccurence)

    rule = await fetch(URI_Rule + `filter[id]=${actualOccurence.attributes.regla}`)
    rule = await rule.json()
    rule = rule.data[0]
  }

  let place = {}
  let district = {}

  if (actualOccurence.attributes.eventual_distrito) {
    console.log("Tengo DISTRICT")
    district = await fetch(`https://ws.rosario.gob.ar/web/api/v1.0/distritos?filter[id]=${actualOccurence.attributes.eventual_distrito}`)
    district = await district.json()
    district = district.data[0]

  }

  if (actualOccurence.relationships.hasOwnProperty("place")) {
    console.log("Tengo PLACE")
    place = await fetch(`https://ws.rosario.gob.ar/web/api/v1.0/lugares?filter[id]=${actualOccurence.relationships.place.data.id}`)
    place = await place.json()
    place = place.data[0]

  }

  console.log(occurences)
  console.log(district)
  res.render('activities-rosario/activity-rosario', { activity, rule, occurences, actualOccurence, place, district })
}


async function renderMercados(req, res) {
  let mercados = {}
  mercados = await fetch(`https://datosabiertos.rosario.gob.ar/api/action/datastore/search.json?resource_id=697edd0e-d127-4383-8586-1a1d84fa76bd&limit=40`)
  mercados = await mercados.json()
  mercados = mercados.result.records

  res.render('activities-rosario/mercados-y-ferias', { mercados })
}

module.exports = {
  renderActivitiesRosario,
  renderActivityRosario,
  renderMercados
}


// Caso a ver ACT 61703 y OCCUR 135951