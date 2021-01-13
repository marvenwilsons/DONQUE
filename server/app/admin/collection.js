const { v4: uuidv4 } = require('uuid');
module.exports = {
    async createCollection(db,{collection_name, collection_schema, created_by}) {
        return await db.query('INSERT INTO dq_collections (collection_name, collection_schema, created_by) values($1, $2, $3)',[
            collection_name,
            collection_schema,
            created_by
        ])
    },
    async getCollectionNames() {
        /** returns an array of collection names,
         *  usefull for creating new collection to compare if the name alreday exist
         */
    },
    async pushNewCollection(db, {collection_name, body, created_by }) {
        const uid = uuidv4()

        

        /** 
         * 1. Insert into dq_collection_item 
         * 2. get the item id of the newly added collection item
         * 3. get the collection_id using the collection name: SELECT collection_id FROM dq_collections WHERE collection_name = $1
         * 4. 
         */

         const getCollectionId = await db.query('SELECT collection_id FROM dq_collections WHERE collection_name = $1', [collection_name])
         const colId = getCollectionId.rows[0].collection_id

         /** Insert into dq_collection_item */
         const addCollectionItem = await db.query('INSERT INTO dq_collection_item (item_of, item_body) VALUES ($1,$2) returning *', [
            colId,  /** collection_id from dq_collections */
            body    /** JSONB */
         ])

         /** Insert or push into dq_collections.collection_content array of uuid */
         const addItemToCollectionContentArray = await db.query('UPDATE dq_collections SET collection_content = array_append(collection_content,$1) WHERE collection_id = $2', [
            addCollectionItem.rows[0].item_id,   /** item_id from dq_collection_item */
            colId   /** collection_id from dq_collections */
         ])

         return addItemToCollectionContentArray
    }
}