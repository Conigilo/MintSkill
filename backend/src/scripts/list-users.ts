import { auth } from '../services/firebase.service'

async function main() {
    try {
        const listUsersResult = await auth.listUsers(10)
        console.log('--- Firebase Auth Users ---')
        listUsersResult.users.forEach((userRecord) => {
            console.log(`- UID: ${userRecord.uid}, Email: ${userRecord.email || 'N/A'}, DisplayName: ${userRecord.displayName || 'N/A'}`)
        })
        console.log('---------------------------')
    } catch (e: any) {
        console.error('Error listing users:', e.message)
    }
}

main()
