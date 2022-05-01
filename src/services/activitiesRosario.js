const fetch = require("node-fetch");
const TagActivityRosario = require('../models/tagActivitiesRosario')

async function replaceSpaceChars(string) {
  string.replace("<p>", "");
  string.replace("</p>", "");
  string.replace("\r", "");
  string.replace("\n", "");
  string.replace("\t", "");
  return string
}

async function searchActivities(activities, occurences, tag) {

  const URI = `https://ws.rosario.gob.ar/web/api/v1.0`
  let URI_Act = `https://ws.rosario.gob.ar/web/api/v1.1` + `/actividades?`
  const URI_Rule = URI + `/reglas?`

  let occur

  if (tag && tag != 'Todas') {
    occur = occurences
  }
  else {
    occur = occurences.data
  }

  for (let o in occur) {

    let tempObj = { occurence: {}, activity: {}, rule: {} }

    const a = await fetch(URI_Act + `&filter[id]=${occur[o].attributes.actividad}`)  // La actividad tiene el tag

    const r = await fetch(URI_Rule + `filter[id]=${occur[o].attributes.regla}`)

    const activity = await a.json()
    const rule = await r.json()

    //Si existe actividad para esa ocurrencia, entonces muestra en pantalla
    if (activity.meta.count != 0) {
      tempObj.occurence.id = occur[o].attributes.id
      tempObj.occurence.name = occur[o].attributes.name
      tempObj.occurence.start_date = occur[o].attributes.dateFull.value
      tempObj.occurence.end_date = occur[o].attributes.dateFull.value2
      tempObj.occurence.suspended = occur[o].attributes.suspendida

      tempObj.activity.id = activity.data[0].attributes.id
      tempObj.activity.name = activity.data[0].attributes.name
      tempObj.activity.start_date = activity.data[0].attributes.start_date
      tempObj.activity.end_date = activity.data[0].attributes.end_date
      //if (activity.data[0].attributes.text.value !== null ) {tempObj.activity.description = activity.data[0].attributes.text.value}
      tempObj.activity.description2 = await replaceSpaceChars(activity.data[0].attributes.summary.value.replace("<p>", ""))
      tempObj.activity.image = activity.data[0].attributes.images[0].self

      if (rule.meta.count != 0) {
        tempObj.rule.id = rule.data[0].attributes.id
        tempObj.rule.name = rule.data[0].attributes.name
        tempObj.rule.start_date = rule.data[0].attributes.date.value
        tempObj.rule.end_date = rule.data[0].attributes.date.value2
        tempObj.rule.text = rule.data[0].attributes.text
        tempObj.rule.frecuency = rule.data[0].attributes.frecuency
      }

      // LUGAR?????   Hay ocurrencias y actividades que no tienen lugar

      activities.push(tempObj)
    }
  }
  return activities
}

async function allTags(tag) {

  let actual

  let allTags = await TagActivityRosario.find({ id: { $ne: 99999 } }).sort({name: 'asc'}).lean() // ID que va a ser usado para revalidar los tags

  if (tag == 'Todas') {
    actual = 'Todas'
  }
  else {
    actual = await TagActivityRosario.find({ id: tag }).lean() // Busco cual es el tag que puse
    actual = actual[0].name
  }

  for (let t in allTags) {allTags[t].actualTag = actual}

  return allTags
}

async function findTag(tag) {

  let tagName = await TagActivityRosario.find({ id: tag }).lean()

  return tagName
}

// async function searchWithTag(dateFrom, dateTo, tag) {
// }

// Paginas
async function calculatePages(cantPages, page) {
  let pages = []
  page = parseInt(page)
  cantPages = parseInt(cantPages)

  if (cantPages <= 10) {
    pages = Array.from({ length: cantPages }, (v, k) => k + 1);
  }
  else if (cantPages > 10 && page < 10) {
    pages = Array.from({ length: 10 }, (v, k) => k + 1);
  }
  else if (cantPages > 10 && page >= 10 && (cantPages - page) >= 4) {
    pages = Array.from({ length: 10 }, (v, k) => k + page - 5);
  }
  else if (cantPages > 10 && page >= 10 && (cantPages - page) < 4) {
    pages = Array.from({ length: 10 }, (v, k) => k + cantPages - 9);
  }

  return pages
}


// async function checkTags() {

//     console.log("Entro a CHECKTAGS")

//     const URI = `https://ws.rosario.gob.ar/web/api/v1.0`
//     const URI_Act = URI + `/actividades?`
//     const URI_Tag = URI + `/tags?`
//     let tagsIDs = []

//     if (await TagActivityRosario.countDocuments() != 0) {
//         // const Tag = new TagActivityRosario({ id: 99999, name: "Todas" })
//         // const m = await fetch(URI_Act + `range=1`)
//         // const meta = await m.json()       

//         // Tag.count = meta.meta.count
//         // await Tag.save()
//         const activites = await paginated_fetch()

//         for(i=0; i<activites.length; i++) {

//             TagControl: for (j = 0; j < activites[i].relationships.tags.data.length; j++) {

//                 let tagsObj = {}
//                 let idTag = activites[i].relationships.tags.data[j].id
//                 let idTagCollection = await TagActivityRosario.find({id: idTag})

//                 if (idTagCollection == []) {
//                     continue TagControl
//                 }
//                 if (tagsIDs.find(id => id == idTag) == idTag) {
//                     continue TagControl
//                 }
//                 else {
//                     const t = await fetch(URI_Tag + `filter[id]=${activites[i].relationships.tags.data[j].id}`)
//                     const tags = await t.json()

//                     const newTag = new TagActivityRosario({ id: tags.data[0].attributes.id, name: tags.data[0].attributes.name })
//                     await newTag.save()
//                     tagsIDs.push(tags.data[0].attributes.id)
//                 }
//             }
//         }
//     }
// }

async function allDistricts(place) {

  let actual

  const URI = `https://ws.rosario.gob.ar/web/api/v1.0/distritos`
  
  const d = await fetch(URI)
  const districts = await d.json()

  if (place == 'Todos') {
    actual = 'Todos'
  }
  else {
    actual = await fetch(URI + `?filter[id]=${place}`)
    actual = await actual.json()
    actual = actual.data[0].attributes.name
  }

  for (let d in districts.data) {districts.data[d].actualDistrict = actual}

  return districts.data

  }

// Funcion para poner todas las paginas en 1
// async function paginated_fetch(
//     tag,
//     url = "https://ws.rosario.gob.ar/web/api/v1.1/actividades?",
//     page = 1,
//     previousResponse = []
//   ) {
//     return await fetch(`${url}include=ocurrencias&filter[tags.id]=${tag}&page=${page}`) // Append the page number to the base URL
//       .then(response => response.json())
//       .then(newResponse => {

//         const response = [...previousResponse, ...newResponse.data]; // Combine the two arrays       

//         if (newResponse.data.length !== 0) {
//           page++;

//           return paginated_fetch(url, page, response);
//         }

//         return response;
//       });
//   }

module.exports = {
  searchActivities,
  allTags,
  findTag,
  calculatePages,
  allDistricts
}