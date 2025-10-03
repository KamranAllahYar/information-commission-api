import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { Role, Permission, Acl } from '@holoyan/adonisjs-permissions'

export default class RoleSeeder extends BaseSeeder {
  public async run() {
    // Create roles
    const superAdminRole = await Role.create({
      title: 'Super Admin',
      slug: 'super_admin',
    })
    const adminRole = await Role.create({
      title: 'Admin',
      slug: 'admin',
    })
    const editorRole = await Role.create({
      title: 'Editor',
      slug: 'editor',
    })

    const viewerRole = await Role.create({
      title: 'Viewer',
      slug: 'viewer',
    })

    const permissions = await Permission.createMany([
      // User Management
      { title: 'View Users', slug: 'view-users' },
      { title: 'Create User', slug: 'create-user' },
      { title: 'Edit User', slug: 'edit-user' },
      { title: 'Delete User', slug: 'delete-user' },

      // Requests Management
      { title: 'View Requests', slug: 'view-requests' },
      { title: 'Create Request', slug: 'create-request' },
      { title: 'Edit Request', slug: 'edit-request' },
      { title: 'Delete Request', slug: 'delete-request' },

      // Complaints Management
      { title: 'View Complaints', slug: 'view-complaints' },
      { title: 'Create Complaint', slug: 'create-complaint' },
      { title: 'Edit Complaint', slug: 'edit-complaint' },
      { title: 'Delete Complaint', slug: 'delete-complaint' },

      // Resources Management
      { title: 'View Resources', slug: 'view-resources' },
      { title: 'Create Resource', slug: 'create-resource' },
      { title: 'Edit Resource', slug: 'edit-resource' },
      { title: 'Delete Resource', slug: 'delete-resource' },

      // Commissioners Management
      { title: 'View Commissioners', slug: 'view-commissioners' },
      { title: 'Create Commissioner', slug: 'create-commissioner' },
      { title: 'Edit Commissioner', slug: 'edit-commissioner' },
      { title: 'Delete Commissioner', slug: 'delete-commissioner' },

      // News Management
      { title: 'View News', slug: 'view-news' },
      { title: 'Create News', slug: 'create-news' },
      { title: 'Edit News', slug: 'edit-news' },
      { title: 'Delete News', slug: 'delete-news' },

      // Settings Management
      { title: 'View Settings', slug: 'view-settings' },
      { title: 'Edit Settings', slug: 'edit-settings' },
    ])

    // Assign permissions to roles
    // Super Admin role gets all permissions
    for (const permission of permissions) {
      await Acl.role(superAdminRole).allow(permission.slug)
    }

    // Admin Role permissions - all except settings
    await Acl.role(adminRole).allow('view-users')

    await Acl.role(adminRole).allow('view-requests')

    await Acl.role(adminRole).allow('view-complaints')

    await Acl.role(adminRole).allow('view-resources')
    await Acl.role(adminRole).allow('create-resource')
    await Acl.role(adminRole).allow('edit-resource')

    await Acl.role(adminRole).allow('view-commissioners')
    await Acl.role(adminRole).allow('create-commissioner')
    await Acl.role(adminRole).allow('edit-commissioner')

    await Acl.role(adminRole).allow('view-news')
    await Acl.role(adminRole).allow('create-news')
    await Acl.role(adminRole).allow('edit-news')
    await Acl.role(adminRole).allow('view-settings')

    // Editor Role permissions - view all, create/edit most (no delete, no user management, no settings)
    await Acl.role(editorRole).allow('view-users')
    await Acl.role(editorRole).allow('view-requests')

    await Acl.role(editorRole).allow('view-complaints')

    await Acl.role(editorRole).allow('view-resources')
    await Acl.role(editorRole).allow('create-resource')
    await Acl.role(editorRole).allow('edit-resource')

    await Acl.role(editorRole).allow('view-commissioners')
    await Acl.role(editorRole).allow('create-commissioner')
    await Acl.role(editorRole).allow('edit-commissioner')

    await Acl.role(editorRole).allow('view-news')
    await Acl.role(editorRole).allow('create-news')
    await Acl.role(editorRole).allow('edit-news')

    // Viewer Role permissions - read-only access
    await Acl.role(viewerRole).allow('view-users')
    await Acl.role(viewerRole).allow('view-requests')
    await Acl.role(viewerRole).allow('view-complaints')
    await Acl.role(viewerRole).allow('view-resources')
    await Acl.role(viewerRole).allow('view-commissioners')
    await Acl.role(viewerRole).allow('view-news')
  }
}
