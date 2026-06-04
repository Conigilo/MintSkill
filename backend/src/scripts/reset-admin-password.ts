import { auth } from '../services/firebase.service'

async function main() {
    try {
        const user = await auth.getUserByEmail('admin@gmail.com')
        await auth.updateUser(user.uid, {
            password: 'admin123'
        })
        console.log('✓ Successfully reset password for admin@gmail.com to "admin123"')
    } catch (e: any) {
        console.error('Error resetting password:', e.message)
    }
}

main()
